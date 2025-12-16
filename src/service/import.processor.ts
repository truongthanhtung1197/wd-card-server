import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { CreateServiceDto } from 'src/service/dto/create-service.dto';
import { ServiceService } from 'src/service/service.service';
import { TYPE_PACK } from 'src/shared/constants/service.constant';

@Processor('import-queue')
export class ImportServiceProcessor {
  constructor(private readonly serviceService: ServiceService) {}
  @Process('import-services-job')
  async handleImport(
    job: Job<{
      services: CreateServiceDto[];
      userId: number;
      typePack: TYPE_PACK;
    }>,
  ) {
    console.log('start Process import job ---->:');
    const { services, userId, typePack } = job.data;

    await this.serviceService.importService(services, userId, typePack);

    console.log(`✅ Imported ${services.length} services for user ${userId}`);
  }
}
