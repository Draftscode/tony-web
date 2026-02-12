import { Injectable } from "@nestjs/common";
import puppeteer from "puppeteer";
import { FileEntity } from "src/entities/file.entity";
import { MessageEntity } from "src/entities/message.entity";
import { UserEntity } from "src/entities/user.entity";
import { DataSource } from "typeorm";
import { FileDataGroup, FileDataPerson } from "./files.model";
import { usePdfPreset } from "./pdf.preset";
import { TONYM_LOGO } from "./tonym";

export type ImportedFile = {
    persons: FileDataPerson[];
    groups: FileDataGroup[];
};

export type ImportedFileWrapper = {
    originalName: string;
    size: number;
    content: ImportedFile;
};

@Injectable()
export class FilesService {
    constructor(private readonly dataSource: DataSource) { }

    // async getAll(query: string, user: UserEntity) {
    //     const [items, total] = await this.dataSource.manager.findAndCount(FileEntity, {
    //         where: {
    //             filename: ILike(`%${query}%`),
    //             userId: user?.users?.length ? In(user.users.map(u => u.id)) : undefined
    //         },
    //         order: {
    //             filename: 'ASC',
    //         },
    //         take: 100,
    //         skip: 0,
    //     })

    //     return { items, total };
    // }
    async getAll(query: string, user: UserEntity, options?: Partial<{ limit: number; offset: number }>) {
        const qb = this.dataSource
            .getRepository(FileEntity)
            .createQueryBuilder('file')

            .leftJoinAndSelect('file.user', 'owner')

            .leftJoin(
                MessageEntity,
                'message',
                `
            message.userId = :userId
            AND message.message->>'filename' = file.filename
            `,
                { userId: user.id }
            )

            .addSelect('message.id', 'message_id')
            .addSelect('message.message', 'message_content')
            .addSelect('message.createdAt', 'message_createdAt')

            .where('file.filename ILIKE :query', { query: `%${query}%` })
            .orderBy('file.lastModified', 'DESC')
            .take(options?.limit ?? 100)
            .skip(options?.offset ?? 0);

        const { entities, raw } = await qb.getRawAndEntities();

        const items = entities.map((file, index) => {
            const fileId = file.id;

            const messages = raw
                .filter(r => r.file_id === fileId && r.message_id)
                .map(r => ({
                    id: r.message_id,
                    message: r.message_content,
                    createdAt: r.message_createdAt,
                }));

            return {
                ...file,
                messages,
            };
        });

        return { items, total: items.length };
    }



    async importFiles(files: ImportedFileWrapper[]) {
        return this.dataSource.manager.transaction(async manager => {
            const entities = files.map(file => {

                return manager.create(FileEntity, {
                    filename: file.originalName,
                    data: {
                        persons: file.content.persons,
                        groups: file.content.groups.map(group => ({
                            ...group,
                            items: group.items.map(item => ({
                                ...item,
                                insurer: item.insurer ? {
                                    ...item.insurer,
                                    logo: item.insurer.image ?? item.insurer.logo,
                                } : undefined
                            }))
                        })),
                    }
                });
            });

            return manager.save(FileEntity, entities);
        });
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

    async createOrUpdateFile(filename: string, fileDto: Partial<FileEntity>, user: UserEntity) {
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
                fileDto.userId = user.id;
                file = manager.create(FileEntity, fileDto);
            }

            await manager.save(file);
            return file;
        });
    }

    getFile(filename: string) {
        return this.dataSource.manager.findOne(FileEntity, { where: { filename } });
    }

    async createPdf(contents: string, options?: Partial<{ logo: string }>) {
        let browser;
        let pdfBuffer;

        try {
            browser = await puppeteer.launch({
                headless: true,
                executablePath: '/usr/bin/chromium-browser',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(usePdfPreset(options?.logo, contents), { waitUntil: 'networkidle0' });
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
        <div style="width:100%; font-size:12px; text-align:center; padding:10px;justify-content: space-between; align-items: center; display: flex; flex-direction: row; gap: 12px">
        <div></div> 
        <div>
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
          <div style="gap: 4px; display: flex; align-items: center; font-size: 10px; color: rgb(100,100,00)">${options?.logo ? `powered by <img src="${TONYM_LOGO}" alt="powered by" style="width: auto; height: 24px" />` : ''}</div>
        </div>
      `,
            });
        } finally {
            await browser?.close();
        }

        return pdfBuffer;
    }
}