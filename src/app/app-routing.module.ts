import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './Login&Auth/login/login.component';
import { OrdersComponent } from './orders/orders.component';
import { ForgotComponent } from './Login&Auth/forgot/forgot.component';
import { OtpComponent } from './Login&Auth/otp/otp.component';
import { ResetComponent } from './Login&Auth/reset/reset.component';
import { ShipmentListComponent } from './Shipment/shipment-list/shipment-list.component';
import { ExceptionListComponent } from './Shipment/exception-list/exception-list.component';
import { NdrsettingsComponent } from './Shipment/ndrsettings/ndrsettings.component';
import { AllocationComponent } from './allocation/allocation.component';
import { UserlistComponent } from './userlist/userlist.component';
import { NdrnewComponent } from './Shipment/ndrnew/ndrnew.component';
import { UserDashboardComponent } from './UserPanel/dashboard/user-dashboard.component';
import { UserOrdersComponent } from './UserPanel/orders/user-orders.component';
import { UserShipmentComponent } from './UserPanel/shipment/user-shipment.component';
import { UserNdrComponent } from './UserPanel/ndr/user-ndr.component';
import { UserReportsComponent } from './UserPanel/Reports/user-reports/user-reports.component';
import { ImportListComponent } from './ImportList/order-importlist/import-list.component';
import { AdminReportsComponent } from './Reports/admin-reports/admin-reports.component';
import { CourierListComponent } from './Courier/courier-list/courier-list.component';
import { NewCourierComponent } from './Courier/new-courier/new-courier.component';
import { EditCourierComponent } from './Courier/edit-courier/edit-courier.component';
import { IntegrateComponent } from './Courier/integrate/integrate.component';
import { WarehouseComponent } from './Warehouse/warehouse/warehouse.component';
import { NewwarehouseComponent } from './Warehouse/newwarehouse/newwarehouse.component';
import { WebhookComponent } from './Webhooks/webhook/webhook.component';
import { AddWebhookComponent } from './Webhooks/add-webhook/add-webhook.component';
import { ConfirmRegistrationComponent } from './Dialog/confirm-registration/confirm-registration.component';
import { OrderReportComponent } from './Reports/order-report/order-report.component';
import { ShipmentReportComponent } from './Reports/shipment-report/shipment-report.component';
import { WarehouseReportComponent } from './Reports/warehouse-report/warehouse-report.component';
import { OrderdetailsComponent } from './details/orderdetails/orderdetails.component';
import { UserwarehouseReportsComponent } from './UserPanel/Reports/warehouse-reports/userwarehouse-reports.component';
import { UsershipmentReportsComponent } from './UserPanel/Reports/shipment-reports/usershipment-reports.component';
import { UserorderReportsComponent } from './UserPanel/Reports/order-reports/userorder-reports.component';
import { ShipmentdetailsComponent } from './details/shipmentdetails/shipmentdetails.component';
import { UserOrderdetailsComponent } from './details/user-orderdetails/user-orderdetails.component';
import { AwbstatusComponent } from './details/awbstatus/awbstatus.component';
import { RtoComponent } from './Shipment/rto/rto.component';
import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';
import { UserRtoComponent } from './UserPanel/user-rto/user-rto.component';
import { EmployeesComponent } from './UserPanel/employees/employees.component';
import { BankListComponent } from './Bank/bank-list/bank-list.component';
import { UserShipmentdetailsComponent } from './details/user-shipmentdetails/user-shipmentdetails.component';
import { authGuard } from './services/auth.guard';
import { VerificationComponent } from './Login&Auth/verification/verification.component';
import { adminAuthGuard } from './services/admin-auth.guard';
import { userAuthGuard } from './services/user-auth.guard';
import { CouriersComponent } from './UserPanel/couriers/couriers.component';
import { IssueticketsComponent } from './issuetickets/issuetickets.component';
import { IssuesComponent } from './UserPanel/issues/issues.component';
import { RtoImportlistComponent } from './ImportList/rto-importlist/rto-importlist.component';
import { RtolistComponent } from './UserPanel/rtolist/rtolist.component';
import { CourierDetailsComponent } from './courier-details/courier-details.component';
import { BillingsComponent } from './billings/billings.component';
import { BranchOrdersComponent } from './Branch/branch-orders/branch-orders.component';
import { NszPageComponent } from './nsz-page/nsz-page.component';
import { PincodeMasterComponent } from './pincode-master/pincode-master.component';
import { OrderConatinerComponent } from './order-conatiner/order-conatiner.component';
import { ShipmentContainerComponent } from './Shipment/shipment-container/shipment-container.component';
import { UserOrderContainerComponent } from './UserPanel/user-order-container/user-order-container.component';
import { UserShipmentsContainerComponent } from './UserPanel/user-shipments-container/user-shipments-container.component';
import { InstaOrderListComponent } from './insta-order-list/insta-order-list.component';
import { UserInstaOrdersListComponent } from './UserPanel/user-insta-orders-list/user-insta-orders-list.component';
import { BranchMasterComponent } from './ManageOrders/branch-master/branch-master.component';
import { ZoneMasterComponent } from './ManageOrders/zone-master/zone-master.component';
import { OldAwbFinderComponent } from './ManageOrders/old-awb-finder/old-awb-finder.component';
import { AutomationLogComponent } from './ManageOrders/automation-log/automation-log.component';
import { UpdateAddressComponent } from './ManageOrders/update-address/update-address.component';
import { RemakeDataComponent } from './ManageOrders/remake-data/remake-data.component';
import { InstaShipmentExportComponent } from './Shipment/insta-shipment-export/insta-shipment-export.component';
import { EditWarehouseComponent } from './Warehouse/edit-warehouse/edit-warehouse.component';
import { RejectionListComponent } from './ManageOrders/rejection-list/rejection-list.component';
import { WebhookLogComponent } from './ManageOrders/webhook-log/webhook-log.component';
import { NdrContainerComponent } from './Shipment/ndr-container/ndr-container.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [authGuard] },
  { path: 'forgot', component: ForgotComponent },
  { path: 'verification', component: VerificationComponent },
  { path: 'otp', component: OtpComponent },
  { path: 'reset', component: ResetComponent },
  { path: 'confirm', component: ConfirmRegistrationComponent },
  {
    path: 'admin/dashboard',
    component: DashboardComponent,
    canActivate: [adminAuthGuard],
  },
  // {path: 'admin/orders' , component:OrdersComponent ,  canActivate: [adminAuthGuard]},
  {
    path: 'admin/orders',
    component: OrderConatinerComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/insta/details/:orderID',
    component: InstaOrderListComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/shipment',
    component: ShipmentContainerComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/insta-exports',
    component: InstaShipmentExportComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/ndr',
    component: NdrContainerComponent,
    canActivate: [adminAuthGuard],
  },
  { path: 'admin/rto', component: RtoComponent, canActivate: [adminAuthGuard] },
  {
    path: 'admin/allocation',
    component: AllocationComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/users',
    component: UserlistComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/reports',
    component: AdminReportsComponent,
    canActivate: [adminAuthGuard],
  },
  // {
  //   path: 'admin/reports/orders',
  //   component: OrderReportComponent,
  //   canActivate: [adminAuthGuard],
  // },
  // {
  //   path: 'admin/reports/shipments',
  //   component: ShipmentReportComponent,
  //   canActivate: [adminAuthGuard],
  // },
  {
    path: 'admin/reports/warehouse',
    component: WarehouseReportComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/couriers',
    component: CourierListComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/warehouses',
    component: WarehouseComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/webhook',
    component: WebhookComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/ndr/settings',
    component: NdrsettingsComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/couriers/add',
    component: NewCourierComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/couriers/edit',
    component: EditCourierComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/orders/list',
    component: ImportListComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/rto/list',
    component: RtoImportlistComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/orders/details/:orderID',
    component: OrderdetailsComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/rejection-list',
    component: RejectionListComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/shipment/details/:orderID',
    component: ShipmentdetailsComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/ndr/details/:orderID',
    component: ShipmentdetailsComponent,
    canActivate: [adminAuthGuard],
  },
  // {
  //   path: 'admin/warehouses/add',
  //   component: NewwarehouseComponent,
  //   canActivate: [adminAuthGuard],
  // },
  //  {
  //   path: 'admin/warehouses/edit',
  //   component: EditWarehouseComponent,
  //   canActivate: [adminAuthGuard],
  // },
  {
    path: 'admin/webhook/add',
    component: AddWebhookComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/ndr/add_settings',
    component: NdrnewComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/sales',
    component: SalesDashboardComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/status/:awb',
    component: AwbstatusComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/banks',
    component: BankListComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/issues',
    component: IssueticketsComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/courier-details',
    component: CourierDetailsComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/bank-invoice',
    component: BillingsComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/nsz',
    component: NszPageComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/pincode-master',
    component: PincodeMasterComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/branch-master',
    component: BranchMasterComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/zone-master',
    component: ZoneMasterComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/awb-finder',
    component: OldAwbFinderComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/automation-log',
    component: AutomationLogComponent,
    canActivate: [adminAuthGuard],
  },
   {
    path: 'admin/webhook-log',
    component: WebhookLogComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/remake',
    component: RemakeDataComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/update-address',
    component: UpdateAddressComponent,
    canActivate: [adminAuthGuard],
  },

  // {path: 'admin/branch-orders' , component:BranchOrdersComponent ,  canActivate: [adminAuthGuard]},

  { path: 'integrate', component: IntegrateComponent },

  {
    path: 'user/dashboard',
    // component: UserDashboardComponent,
    component: DashboardComponent,
    canActivate: [userAuthGuard],
  },
  {
    path: 'user/orders',
    component: OrderConatinerComponent ,
    canActivate: [userAuthGuard],
  },
  {
    path: 'user/shipment',
    // component: UserShipmentsContainerComponent,
    component: ShipmentContainerComponent,
    canActivate: [userAuthGuard],
  },

  {
    path: 'user/ndr',
    // component: UserNdrComponent,
    component: NdrContainerComponent,
    canActivate: [userAuthGuard],
  },
  {
    path: 'user/reports',
    // component: UserReportsComponent,
    component: AdminReportsComponent,
    canActivate: [userAuthGuard],
  },
  // {
  //   path: 'user/reports/order',
  //   // component: UserorderReportsComponent,
  //   component: OrderReportComponent,
  //   canActivate: [userAuthGuard],
  // },
  // {
  //   path: 'user/reports/shipments',
  //   component: UsershipmentReportsComponent,
  //   canActivate: [userAuthGuard],
  // },
  {
    path: 'user/reports/warehouse',
    component: UserwarehouseReportsComponent,
    canActivate: [userAuthGuard],
  },

  {
    path: 'user/orders/details/:orderID',
    component: UserOrderdetailsComponent,
    canActivate: [userAuthGuard],
  },
  {
    path: 'user/insta/details/:orderID',
    component: UserInstaOrdersListComponent,
    canActivate: [userAuthGuard],
  },
  {
    path: 'user/shipment/details/:orderID',
    component: UserOrderdetailsComponent,
    canActivate: [userAuthGuard],
  },
  {
    path: 'user/ndr/details/:orderID',
    component: UserOrderdetailsComponent,
    canActivate: [userAuthGuard],
  },

  {
    path: 'user/status/:awb',
    component: AwbstatusComponent,
    canActivate: [userAuthGuard],
  },
  {
    path: 'user/rto/orders',
    // component: UserRtoComponent,
    component: RtoComponent,
    canActivate: [userAuthGuard],
  },
  {
    path: 'user/rto/list',
    component: RtolistComponent,
    // component: RtolistComponent,  --> it is only for admin
    canActivate: [userAuthGuard],
  },
  {
    path: 'user/employees',
    component: EmployeesComponent,
    canActivate: [userAuthGuard],
  },
  {
    path: 'user/issues',
    // component: IssuesComponent,
    component: IssueticketsComponent,
    canActivate: [userAuthGuard],
  },
  {
    path: 'user/couriers',
    // component: CouriersComponent,
    component: CourierListComponent,
    canActivate: [userAuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
