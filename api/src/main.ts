import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase request size limits
  app.use(bodyParser.json({ limit: '10mb' }));   // for JSON
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // for form-data

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
