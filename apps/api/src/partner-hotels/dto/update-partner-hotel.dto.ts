import { PartialType } from '@nestjs/mapped-types';
import { CreatePartnerHotelDto } from './create-partner-hotel.dto';

export class UpdatePartnerHotelDto extends PartialType(CreatePartnerHotelDto) {}
