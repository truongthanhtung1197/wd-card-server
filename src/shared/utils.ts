import { Order } from 'src/order/entities/order.entity';
import { ROLE } from 'src/role/role.constant';
import { Service } from 'src/service/entities/service.entity';
import { ORDER_STATUS } from 'src/shared/constants/order.constant';
import { SERVICE_TYPE } from 'src/shared/constants/service.constant';
import { TEAM_MEMBER_ROLE } from 'src/shared/constants/team.constant';

export function covertObjectToSearchParams(obj: Record<string, any>): string {
  const params = new URLSearchParams();

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item: any) => {
          params.append(key, item);
        });
      } else {
        params.append(key, value);
      }
    }
  });

  return params.toString();
}

export const rolePermissions: Record<
  ROLE & TEAM_MEMBER_ROLE,
  {
    allowedStatuses: ORDER_STATUS[];
    isAllowed: (
      changeToStatus: ORDER_STATUS,
      currentStatus: ORDER_STATUS,
    ) => boolean;
    currentAllowedStatuses: ORDER_STATUS[];
  }
> = {
  [ROLE.PARTNER]: {
    allowedStatuses: [
      ORDER_STATUS.CONFIRMED_BY_PARTNER,
      ORDER_STATUS.COMPLETED_BY_PARTNER,
    ],
    isAllowed: (to, current) => {
      if (to === ORDER_STATUS.CONFIRMED_BY_PARTNER) {
        return current === ORDER_STATUS.CONFIRMED_BY_TEAM_LEADER;
      }
      if (to === ORDER_STATUS.COMPLETED_BY_PARTNER) {
        return current === ORDER_STATUS.CONFIRMED_BY_PARTNER;
      }
      return false;
    },
  },
  [ROLE.TEAM_LEADER]: {
    allowedStatuses: [
      ORDER_STATUS.CONFIRMED_BY_TEAM_LEADER,
      ORDER_STATUS.REJECTED_BY_TEAM_LEADER,
    ],
    isAllowed: (to, current) => {
      if (to === ORDER_STATUS.CONFIRMED_BY_TEAM_LEADER) {
        return [
          ORDER_STATUS.SEOER_ORDER,
          ORDER_STATUS.REJECTED_BY_TEAM_LEADER,
        ].includes(current);
      }
      if (to === ORDER_STATUS.REJECTED_BY_TEAM_LEADER) {
        return [
          ORDER_STATUS.SEOER_ORDER,
          ORDER_STATUS.CONFIRMED_BY_TEAM_LEADER,
        ].includes(current);
      }
      return false;
    },
    currentAllowedStatuses: [
      ORDER_STATUS.SEOER_ORDER,
      ORDER_STATUS.REJECTED_BY_TEAM_LEADER,
      ORDER_STATUS.CONFIRMED_BY_TEAM_LEADER,
    ],
  },
  [ROLE.VICE_TEAM_LEADER]: {
    allowedStatuses: [
      ORDER_STATUS.CONFIRMED_BY_TEAM_LEADER,
      ORDER_STATUS.REJECTED_BY_TEAM_LEADER,
    ],
    isAllowed: (to, current) => {
      if (to === ORDER_STATUS.CONFIRMED_BY_TEAM_LEADER) {
        return [
          ORDER_STATUS.SEOER_ORDER,
          ORDER_STATUS.REJECTED_BY_TEAM_LEADER,
        ].includes(current);
      }
      if (to === ORDER_STATUS.REJECTED_BY_TEAM_LEADER) {
        return [
          ORDER_STATUS.SEOER_ORDER,
          ORDER_STATUS.CONFIRMED_BY_TEAM_LEADER,
        ].includes(current);
      }
      return false;
    },
    currentAllowedStatuses: [
      ORDER_STATUS.SEOER_ORDER,
      ORDER_STATUS.REJECTED_BY_TEAM_LEADER,
      ORDER_STATUS.CONFIRMED_BY_TEAM_LEADER,
    ],
  },
  [ROLE.SEOER]: {
    allowedStatuses: [
      ORDER_STATUS.SEOER_ORDER,
      ORDER_STATUS.CANCELLED_BY_SEOER,
      ORDER_STATUS.CONFIRMED_COMPLETION_BY_SEOER,
    ],
    isAllowed: (to, current) => {
      if (to === ORDER_STATUS.SEOER_ORDER) {
        return current === ORDER_STATUS.CANCELLED_BY_SEOER;
      }
      if (to === ORDER_STATUS.CONFIRMED_COMPLETION_BY_SEOER) {
        return current === ORDER_STATUS.COMPLETED_BY_PARTNER;
      }
      if (to === ORDER_STATUS.CANCELLED_BY_SEOER) {
        return [
          ORDER_STATUS.SEOER_ORDER,
          ORDER_STATUS.CONFIRMED_BY_TEAM_LEADER,
        ].includes(current);
      }
      return false;
    },
  },
  [ROLE.MANAGER]: {
    allowedStatuses: [
      ORDER_STATUS.PAYMENT_APPROVED_BY_MANAGER,
      ORDER_STATUS.PAID_BY_MANAGER,
      ORDER_STATUS.CANCELLED_BY_MANAGER,
    ],
    isAllowed: (to, current) => {
      if (to === ORDER_STATUS.PAYMENT_APPROVED_BY_MANAGER) {
        return [
          ORDER_STATUS.CONFIRMED_COMPLETION_BY_SEOER,
          ORDER_STATUS.COMPLETED_BY_PARTNER,
        ].includes(current);
      }
      if (to === ORDER_STATUS.PAID_BY_MANAGER) {
        return [ORDER_STATUS.PAYMENT_APPROVED_BY_MANAGER].includes(current);
      }
      if (to === ORDER_STATUS.CANCELLED_BY_MANAGER) {
        return true;
      }
      return false;
    },
  },
  [ROLE.ASSISTANT]: {
    allowedStatuses: [
      ORDER_STATUS.PAYMENT_APPROVED_BY_MANAGER,
      ORDER_STATUS.PAID_BY_MANAGER,
      ORDER_STATUS.CANCELLED_BY_MANAGER,
    ],
    isAllowed: (to, current) => {
      if (to === ORDER_STATUS.PAYMENT_APPROVED_BY_MANAGER) {
        return [
          ORDER_STATUS.CONFIRMED_COMPLETION_BY_SEOER,
          ORDER_STATUS.COMPLETED_BY_PARTNER,
        ].includes(current);
      }
      if (to === ORDER_STATUS.PAID_BY_MANAGER) {
        return [ORDER_STATUS.PAYMENT_APPROVED_BY_MANAGER].includes(current);
      }
      if (to === ORDER_STATUS.CANCELLED_BY_MANAGER) {
        return true;
      }
      return false;
    },
  },
  [ROLE.SUPER_ADMIN]: {
    allowedStatuses: Object.values(ORDER_STATUS),
    isAllowed: () => true,
  },
};

export const checkPermissionChangeStatusOrder = ({
  userRole,
  currentStatus,
  changeToStatus,
}: {
  userRole: ROLE;
  currentStatus: ORDER_STATUS;
  changeToStatus: ORDER_STATUS;
}): any => {
  const permissionStatus = false;
  const allowedStatuses: ORDER_STATUS[] = [];

  const result = {
    permissionStatus,
    allowedStatuses,
  };

  if (userRole === ROLE.SUPER_ADMIN) {
    result.permissionStatus = true;
    result.allowedStatuses = Object.values(ORDER_STATUS);
    return result;
  }

  const permission = rolePermissions[userRole];

  if (!permission || !permission.allowedStatuses.includes(changeToStatus)) {
    return {
      allowedStatuses: [],
      permissionStatus: false,
    };
  }

  const isAllow = permission.isAllowed(changeToStatus, currentStatus);

  return {
    allowedStatuses: permission.allowedStatuses,
    permissionStatus: isAllow,
  };
};

export const getPriceAndDiscountService = (
  serviceType?: SERVICE_TYPE,
  service?: Service,
) => {
  if (!serviceType || !service) {
    return { price: 0, discount: 0 };
  }
  if (serviceType === SERVICE_TYPE.GP) {
    return {
      price: Number(service?.guestPostPrice) || 0,
      discount: Number(service?.discountGuestPostService) || 0,
    };
  }
  if (serviceType === SERVICE_TYPE.TEXTLINK) {
    return {
      price: Number(service?.textLinkPrice) || 0,
      discount: Number(service?.discountTextLinkService) || 0,
    };
  }
  if (serviceType === SERVICE_TYPE.BANNER) {
    return {
      price: Number(service?.bannerPrice) || 0,
      discount: Number(service?.discountBannerService) || 0,
    };
  }
  return {
    price: Number(service?.price) || 0,
    discount: Number(service?.discountPackService) || 0,
  };
};

export const JsonTransformer = {
  to: (value: any) => {
    return value !== undefined ? JSON.stringify(value) : null;
  },
  from: (value: any) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  },
};

export const getTotalPriceOrder = (order: Order) => {
  return (
    Number(order.price || 0) -
    Number(order.discount || 0) +
    Number(order.priceAdjustment || 0)
  );
};

export const ORDER_STATUS_LABEL_OPTIONS = [
  { key: ORDER_STATUS.SEOER_ORDER, label: 'SEOER tạo đơn' },
  { key: ORDER_STATUS.CONFIRMED_BY_TEAM_LEADER, label: 'TT/TP đã xác nhận' },
  { key: ORDER_STATUS.REJECTED_BY_TEAM_LEADER, label: 'TT/TP đã từ chối' },
  { key: ORDER_STATUS.CANCELLED_BY_SEOER, label: 'SEOer đã huỷ đơn' },
  { key: ORDER_STATUS.CONFIRMED_BY_PARTNER, label: 'NCC đã xác nhận' },
  { key: ORDER_STATUS.COMPLETED_BY_PARTNER, label: 'NCC đã hoàn thành' },
  {
    key: ORDER_STATUS.CONFIRMED_COMPLETION_BY_SEOER,
    label: 'SEOer đã xác nhận hoàn thành',
  },
  {
    key: ORDER_STATUS.PAYMENT_APPROVED_BY_MANAGER,
    label: 'TL SEO đã duyệt thanh toán',
  },
  { key: ORDER_STATUS.CANCELLED_BY_MANAGER, label: 'Quản lý đã huỷ đơn' },
  { key: ORDER_STATUS.PAID_BY_MANAGER, label: 'TL đã thanh toán' },
];

export const getOrderStatusLabel = (status: ORDER_STATUS): string => {
  return getLabelFromOptions(status, ORDER_STATUS_LABEL_OPTIONS);
};

export const getLabelFromOptions = (key: string, option: any[]): string => {
  return (
    option?.find((i) => {
      return i.key === key;
    })?.label || ''
  );
};
