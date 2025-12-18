import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_KEY') || '',
    });
  }

  /**
   * Giá trị trả về của hàm validate sẽ được gắn vào request.user
   * và dùng bởi @CurrentUser().
   *
   * Ở đây ta chỉ cần id và email; roles sẽ được lấy từ bảng user_roles.
   */
  validate(payload: any) {
    console.log(payload, 9999);
    return {
      id: payload.sub,
      email: payload.email,
      ...payload,
    };
  }
}
