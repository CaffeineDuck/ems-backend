import { PartialType } from '@nestjs/swagger';
import { AddDocumentsDto } from './add-documents.dto';

export class UpdateDocumentsDto extends PartialType(AddDocumentsDto) {}
