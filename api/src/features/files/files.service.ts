import { Injectable } from "@nestjs/common";
import puppeteer from "puppeteer";
import { FileEntity } from "src/entities/file.entity";
import { DataSource, ILike } from "typeorm";
import { usePdfPreset } from "./pdf.preset";

@Injectable()
export class FilesService {
    constructor(private readonly dataSource: DataSource) { }

    getAll(query: string) {
        return this.dataSource.manager.find(FileEntity, {
            where: {
                filename: ILike(`%${query}%`),
            }
        })
    }

    async removeFile(filename: string) {
        return this.dataSource.transaction(async manager => {
            return manager.delete(FileEntity, { filename });
        });
    }

    async moveFile(fromPath: string, toPath: string) {
        return this.dataSource.transaction(async manager => {
            return manager.update(FileEntity, { filename: fromPath }, { filename: toPath });
        });
    }

    async createOrUpdateFile(filename: string, fileDto: Partial<FileEntity>) {
        return this.dataSource.transaction(async manager => {
            // check if a file with the same filename already exists
            let file = await manager.findOne(FileEntity, {
                where: { filename },
            });

            if (file) {
                // update existing file
                manager.merge(FileEntity, file, fileDto);
            } else {
                fileDto.filename = filename;
                // create a new one
                file = manager.create(FileEntity, fileDto);
            }

            await manager.save(file);
            return file;
        });
    }

    getFile(filename: string) {
        return this.dataSource.manager.findOne(FileEntity, { where: { filename } });
    }

    async createPdf(contents: string) {
        let browser;
        let pdfBuffer;

        try {
            browser = await puppeteer.launch({
                headless: true,
                executablePath: '/usr/bin/chromium-browser',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(usePdfPreset(contents), { waitUntil: 'networkidle0' });
            pdfBuffer = await page.pdf({
                format: 'A4',                 // Page size
                landscape: true,              // Landscape mode
                printBackground: true,        // Include background colors/images
                displayHeaderFooter: true,    // Enable header/footer
                margin: { top: '60px', bottom: '60px', left: '20px', right: '20px' },

                // Header template
                headerTemplate: `
        <div style="font-size:12px; text-align:center; padding:10px;">
          <!-- Empty or your header content -->
        </div>
        <style>
          /* Optional: hide header on first page */
          div[data-header]:first-child { display:none; }
        </style>
      `,

                // Footer template
                footerTemplate: `
        <div style="width:100%; font-size:12px; text-align:center; padding:10px;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
            });
        } finally {
            await browser?.close();
        }

        return pdfBuffer;
    }
}