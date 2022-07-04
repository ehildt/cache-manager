import { CacheManagerModule } from '@/cache-manager/cache-manager.module';
import { ConsoleLogger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppConfigRegistry } from './configs/app-config/app-config-registry.dbs';
import { ConfigFactoryService } from './configs/config-factory.service';

@Module({
  imports: [
    CacheManagerModule,
    ConfigModule.forRoot({
      cache: true,
      ignoreEnvFile: true,
      load: [AppConfigRegistry],
    }),
  ],
  providers: [AppService, ConsoleLogger, ConfigFactoryService],
})
export class AppModule {}
