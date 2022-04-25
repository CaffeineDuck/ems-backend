import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkshopDto } from './create-workshop.dto';

export class UpdateWorkshopDto extends PartialType(CreateWorkshopDto) {}
