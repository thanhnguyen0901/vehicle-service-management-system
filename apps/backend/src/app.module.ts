import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CustomerModule } from './modules/customer/customer.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { ServiceCatalogModule } from './modules/service-catalog/service-catalog.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 1 minute
        limit: 100,  // 100 requests per minute per IP
      },
    ]),
    PrismaModule,
    AuthModule,
    UserModule,
    CustomerModule,
    VehicleModule,
    ServiceCatalogModule,
    InventoryModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
