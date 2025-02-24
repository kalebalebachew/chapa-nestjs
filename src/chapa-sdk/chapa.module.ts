import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { ChapaService } from './chapa.service';
import { CHAPA_OPTIONS } from './constants';
import { ChapaOptions, ChapaAsyncOptions, ChapaOptionsFactory } from './interfaces';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  providers: [ChapaService],
  exports: [ChapaService],
})
export class ChapaModule {
  /**
   * Synchronous registration.
   */
  public static register(options: ChapaOptions): DynamicModule {
    return {
      module: ChapaModule,
      providers: [
        {
          provide: CHAPA_OPTIONS,
          useValue: options,
        },
        ChapaService,
      ],
      exports: [ChapaService],
    };
  }

  /**
   * Asynchronous registration using dynamic options.
   */
  public static registerAsync(options: ChapaAsyncOptions): DynamicModule {
    const chapaOptionsProvider: Provider = {
      provide: CHAPA_OPTIONS,
      useFactory: options.useFactory
        ? options.useFactory
        : async (optionsFactory: ChapaOptionsFactory) => {
            return await optionsFactory.createChapaOptions();
          },
      inject: options.useFactory ? (options.inject || []) : [options.useExisting || options.useClass],
    };

    return {
      module: ChapaModule,
      imports: options.imports || [],
      providers: [chapaOptionsProvider, ChapaService],
      exports: [ChapaService],
    };
  }
}
