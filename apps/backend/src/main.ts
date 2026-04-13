import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  // 1. UPDATE CORS: Allow both localhost and your network IP
  app.enableCors({
    origin: [
      "http://10.2.103.35:3000" // Add your frontend IP here
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization, Cookie',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = 3001; 
  
  // 2. UPDATE LISTEN: Listen on '0.0.0.0' to accept network traffic
  // This allows the backend to be reached via your IP (10.2.103.35)
  await app.listen(port, '0.0.0.0'); 
  
  console.log(`🚀 Backend is running on port: ${port}`);
  console.log(`🔗 Local: http://localhost:${port}`);
  console.log(`🌐 Network: http://10.2.103.35:${port}`);
}
bootstrap();