import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { inject } from "@angular/core";
import { SellerService } from "./seller.service";

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const sellerService = inject(SellerService);
  const router = inject(Router);

  const roleValue = sellerService.getItem("role");

  const userRole = roleValue ? parseInt(roleValue, 10) : null;
  const allowedRoutesForRole2 = [
    "/admin/dashboard",
    "/admin/orders",
    "/admin/shipment",
    "/admin/ndr",
    "/admin/rto",
    "/admin/rto/list",
    "/admin/reports",
    "/admin/orders/list",
    "/admin/insta/details",
    "/admin/status",
    "/admin/allocation",
    "/admin/pincode-master",
    "/admin/nsz",
    "/admin/courier",
    "/admin/courier-details",
    "/admin/bank-invoice",
    "/admin/branch-master",
    "/admin/zone-master",
    "/admin/awb-finder",
    "/admin/automation-log",
    "/admin/update-address",
    "/admin/remake",
    "/admin/insta-exports",
    "/admin/rejection-list",
    "/admin/webhook-log"
  ];
  const currentPath = state.url.split("?")[0];

  if (currentPath.startsWith("/user") && (userRole === 1 || userRole === 2)) {
    router.navigate(["/login"]);
    return false;
  }

  if (userRole === 1) {
    return true;
  } else if (userRole === 2) {
    const isAllowedPath = allowedRoutesForRole2.some(
      (basePath) =>
        currentPath.startsWith(basePath) ||
        allowedRoutesForRole2.some(
          (path) => path.split("/:")[0] === currentPath.split("/:")[0]
        )
    );

    if (isAllowedPath) {
      return true;
    }
  }

  router.navigate(["/login"]);
  return false;
};
