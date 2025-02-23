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
   * Registers a configured Chapa Module for import into the current module
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
   * Registers a configured Chapa Module for import into the current module
   * using dynamic options (factory, etc)
   */
  public static registerAsync(options: ChapaAsyncOptions): DynamicModule {
    return {
      module: ChapaModule,
      imports: options.imports || [],
      providers: [
        this.createOptionsProvider(options),
        ChapaService,
      ],
      exports: [ChapaService],
    };
  }

  private static createProviders(
    options: ChapaAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createOptionsProvider(options)];
    }

    return [
      this.createOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createOptionsProvider(
    options: ChapaAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: CHAPA_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    // For useExisting...
    return {
  provide: CHAPA_OPTIONS,
      useFactory: async (optionsFactory: ChapaOptionsFactory) =>
        await optionsFactory.createChapaOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }

 }
