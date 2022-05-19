import { PartialType } from '@nestjs/swagger';
import { CreateWorkshopDto } from './create-workshop.dto';

export class UpdateWorkshopDto extends PartialType(CreateWorkshopDto) {}
