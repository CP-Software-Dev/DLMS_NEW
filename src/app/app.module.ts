import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { MatDialogModule, MatDialogRef , MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ToastrModule, provideToastr } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule  } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';




import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BodyComponent } from './body/body.component';
import { SidenavComponent } from './Shared/sidenav/sidenav.component';
import { OrdersComponent } from './orders/orders.component';
import { LoginComponent } from './Login&Auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './Shared/header/header.component';
import { ForgotComponent } from './Login&Auth/forgot/forgot.component';
import { OtpComponent } from './Login&Auth/otp/otp.component';
import { ResetComponent } from './Login&Auth/reset/reset.component';
import { ShipmentListComponent } from './Shipment/shipment-list/shipment-list.component';
import { ExceptionListComponent } from './Shipment/exception-list/exception-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NdrsettingsComponent } from './Shipment/ndrsettings/ndrsettings.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AllocationComponent } from './allocation/allocation.component';
import { UserlistComponent } from './userlist/userlist.component';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { NdrnewComponent } from './Shipment/ndrnew/ndrnew.component';
// import { UserSidenavComponent } from './UserPanel/sidenav/user-sidenav.component';
import { UserDashboardComponent } from './UserPanel/dashboard/user-dashboard.component';
import { UserOrdersComponent } from './UserPanel/orders/user-orders.component';
import { UserShipmentComponent } from './UserPanel/shipment/user-shipment.component';
import { UserNdrComponent } from './UserPanel/ndr/user-ndr.component';
import { ImportListComponent } from './ImportList/order-importlist/import-list.component';
import { AdminReportsComponent } from './Reports/admin-reports/admin-reports.component';
import { AllocationRuletestingComponent } from './allocation-ruletesting/allocation-ruletesting.component';
import { AllocationShippingrulesComponent } from './allocation-shippingrules/allocation-shippingrules.component';
import { CourierListComponent } from './Courier/courier-list/courier-list.component';
import { NewCourierComponent } from './Courier/new-courier/new-courier.component';
import { EditCourierComponent } from './Courier/edit-courier/edit-courier.component';
import { CourierDeliveryComponent } from './Courier/courier-delivery/courier-delivery.component';
import { CourierSettingsComponent } from './Courier/courier-settings/courier-settings.component';
import { IntegrateComponent } from './Courier/integrate/integrate.component';
import { WarehouseComponent } from './Warehouse/warehouse/warehouse.component';
import { NewwarehouseComponent } from './Warehouse/newwarehouse/newwarehouse.component';
import { WebhookComponent } from './Webhooks/webhook/webhook.component';
import { AddWebhookComponent } from './Webhooks/add-webhook/add-webhook.component';
import { OrderUploadComponent } from './Dialog/order-upload/order-upload.component';
import { ChangestatusDialogComponent } from './Dialog/changestatus-dialog/changestatus-dialog.component';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { customInterceptor } from './services/custom.interceptor';
import { ConfirmRegistrationComponent } from './Dialog/confirm-registration/confirm-registration.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AddCourierComponent } from './Dialog/courier/add-courier/add-courier.component';
import { FetchAWBComponent } from './Dialog/fetch-awb/fetch-awb.component';
import { PaginatorComponent } from './Shared/paginator/paginator.component';
import { OrdersGraphComponent } from './graphs/orders-graph/orders-graph.component';
import { ShipmentsGraphComponent } from './graphs/shipments-graph/shipments-graph.component';
import { OrderReportComponent } from './Reports/order-report/order-report.component';
import { ShipmentReportComponent } from './Reports/shipment-report/shipment-report.component';
import { WarehouseReportComponent } from './Reports/warehouse-report/warehouse-report.component';
import { BulkshipComponent } from './Dialog/bulkship/bulkship.component';
import { OrderdetailsComponent } from './details/orderdetails/orderdetails.component';
import { UserReportsComponent } from './UserPanel/Reports/user-reports/user-reports.component';
import { UserorderReportsComponent } from './UserPanel/Reports/order-reports/userorder-reports.component';
import { UsershipmentReportsComponent } from './UserPanel/Reports/shipment-reports/usershipment-reports.component';
import { UserwarehouseReportsComponent } from './UserPanel/Reports/warehouse-reports/userwarehouse-reports.component';
import { ShipmentdetailsComponent } from './details/shipmentdetails/shipmentdetails.component';
import { UserOrderdetailsComponent } from './details/user-orderdetails/user-orderdetails.component';
import { AwbstatusComponent } from './details/awbstatus/awbstatus.component';
import { RtoComponent } from './Shipment/rto/rto.component';
import { RtoEditComponent } from './Dialog/rto-edit/rto-edit.component';
import { RtoChangeStatusComponent } from './Dialog/rto-change-status/rto-change-status.component';
import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';
import { DaterangeComponent } from './Shared/Dates/daterange/daterange.component';
import { CourierGraphComponent } from './graphs/courier-graph/courier-graph.component';
import { CourierGraphModule } from './graphs/courier-graph/courier-graph.module';
import { SellerorderGraphComponent } from './UserPanel/Graphs/sellerorder-graph/sellerorder-graph.component';
import { SellershipmentsGraphComponent } from './UserPanel/Graphs/sellershipments-graph/sellershipments-graph.component';
import { SellercourierGraphComponent } from './UserPanel/Graphs/sellercourier-graph/sellercourier-graph.component';
import { UserRtoComponent } from './UserPanel/user-rto/user-rto.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SalespersonDialogComponent } from './Dialog/salesperson-dialog/salesperson-dialog.component';
import { DatepickerComponent } from './Shared/Dates/datepicker/datepicker.component';
import { EmployeesComponent } from './UserPanel/employees/employees.component';
import { AddEmployeeComponent } from './Dialog/add-employee/add-employee.component';
import { BankListComponent } from './Bank/bank-list/bank-list.component';
import { AddbankComponent } from './Bank/addbank/addbank.component';
import { UserShipmentdetailsComponent } from './details/user-shipmentdetails/user-shipmentdetails.component';
import { EditPermissionsComponent } from './Dialog/edit-permissions/edit-permissions.component';
import { HellpbtnComponent } from './Shared/hellpbtn/hellpbtn.component';
import { VerificationComponent } from './Login&Auth/verification/verification.component';
import { CouriersComponent } from './UserPanel/couriers/couriers.component';
import { ManagecourierComponent } from './Dialog/managecourier/managecourier.component';
import { LoaderComponent } from './Shared/loader/loader.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RtoUploadComponent } from './Dialog/rto-upload/rto-upload.component';
import { EditpriorityComponent } from './Dialog/editpriority/editpriority.component';
import { ViewcourierComponent } from './Dialog/viewcourier/viewcourier.component';
import { IssueticketsComponent } from './issuetickets/issuetickets.component';
import { IssuedetailsComponent } from './Dialog/issuedetails/issuedetails.component';
import { IssuesComponent } from './UserPanel/issues/issues.component';
import { RtoImportlistComponent } from './ImportList/rto-importlist/rto-importlist.component';
import { RtolistComponent } from './UserPanel/rtolist/rtolist.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { WebhookViewComponent } from './Dialog/webhook-view/webhook-view.component';
import { CourierDetailsComponent } from './courier-details/courier-details.component';
import { BillingsComponent } from './billings/billings.component';
import { BranchOrdersComponent } from './Branch/branch-orders/branch-orders.component';
import { UploadBranchOrdersComponent } from './Branch/upload-branch-orders/upload-branch-orders.component';
import { NszPageComponent } from './nsz-page/nsz-page.component';
import { PincodeMasterComponent } from './pincode-master/pincode-master.component';
import { PincodeFileUploadComponent } from './Dialog/pincode-file-upload/pincode-file-upload.component';
import { InstaOrdersComponent } from './insta-orders/insta-orders.component';
import { OrderConatinerComponent } from './order-conatiner/order-conatiner.component';
import { ShipmentContainerComponent } from './Shipment/shipment-container/shipment-container.component';
import { UserOrderContainerComponent } from './UserPanel/user-order-container/user-order-container.component';
import { UserShipmentsContainerComponent } from './UserPanel/user-shipments-container/user-shipments-container.component';
import { UserInstaOrdersComponent } from './UserPanel/user-insta-orders/user-insta-orders.component';
import { UserInstaShipmentsComponent } from './UserPanel/user-insta-shipments/user-insta-shipments.component';
import { InstaShipmentComponent } from './Shipment/insta-shipment/insta-shipment.component';
import { InstaOrderListComponent } from './insta-order-list/insta-order-list.component';
import { UserInstaOrdersListComponent } from './UserPanel/user-insta-orders-list/user-insta-orders-list.component';
import { DatePickerInvoiceComponent } from './Shared/Dates/date-picker-invoice/date-picker-invoice.component';
import { ZoneMasterComponent } from './ManageOrders/zone-master/zone-master.component';
import { BranchMasterComponent } from './ManageOrders/branch-master/branch-master.component';
import { UpdateAddressComponent } from './ManageOrders/update-address/update-address.component';
import { OldAwbFinderComponent } from './ManageOrders/old-awb-finder/old-awb-finder.component';
import { AutomationLogComponent } from './ManageOrders/automation-log/automation-log.component';
import { InstaRemkakeComponent } from './Dialog/insta-remkake/insta-remkake.component';
import { BranchMasterFileUploadComponent } from './Dialog/branch-master-file-upload/branch-master-file-upload.component';
import { ZoneMasterFileUploadComponent } from './Dialog/zone-master-file-upload/zone-master-file-upload.component';
import { AddressupdateComponent } from './Dialog/addressupdate/addressupdate.component';
import { RemakeFileUploadComponent } from './Dialog/remake-file-upload/remake-file-upload.component';
import { RemakeDataComponent } from './ManageOrders/remake-data/remake-data.component';
import { InstaShipmentExportComponent } from './Shipment/insta-shipment-export/insta-shipment-export.component';
import { EditWarehouseComponent } from './Warehouse/edit-warehouse/edit-warehouse.component';
import { RejectionListComponent } from './ManageOrders/rejection-list/rejection-list.component';
import { WebhookLogComponent } from './ManageOrders/webhook-log/webhook-log.component';
import { InstaExceptionsComponent } from './Shipment/insta-exceptions/insta-exceptions.component';
import { NdrContainerComponent } from './Shipment/ndr-container/ndr-container.component';
import { IntakeVsDeliveryComponent } from './graphs/intake-vs-delivery/intake-vs-delivery.component';
import { CourierTracking } from './graphs/courier-tracking/courier-tracking.component';
import { DateRangeFilterComponent } from './Shared/Dates/date-range-filter/date-range-filter.component';
@NgModule({
  declarations: [
    OrderConatinerComponent,
    AppComponent,
    BodyComponent,
    SidenavComponent,
    OrdersComponent,
    LoginComponent,
    DashboardComponent,
    HeaderComponent,
    ForgotComponent,
    OtpComponent,
    ResetComponent,
    ShipmentListComponent,
    ExceptionListComponent,
    NdrsettingsComponent,
    AllocationComponent,
    UserlistComponent,
    UserDialogComponent,
    NdrnewComponent,
    // UserSidenavComponent,
    UserDashboardComponent,
    UserOrdersComponent,
    UserShipmentComponent,
    UserNdrComponent,
    UserReportsComponent,
    ImportListComponent,
    AdminReportsComponent,
    AllocationRuletestingComponent,
    AllocationShippingrulesComponent,
    CourierListComponent,
    NewCourierComponent,
    EditCourierComponent,
    CourierDeliveryComponent,
    CourierSettingsComponent,
    IntegrateComponent,
    WarehouseComponent,
    NewwarehouseComponent,
    WebhookComponent,
    AddWebhookComponent,
    OrderUploadComponent,
    ChangestatusDialogComponent,
    ConfirmRegistrationComponent,
    ChangePasswordComponent,
    AddCourierComponent,
    FetchAWBComponent,
    PaginatorComponent,
    OrdersGraphComponent,
    ShipmentsGraphComponent,
    OrderReportComponent,
    ShipmentReportComponent,
    WarehouseReportComponent,
    BulkshipComponent,
    OrderdetailsComponent,
    UserorderReportsComponent,
    UsershipmentReportsComponent,
    UserwarehouseReportsComponent,
    ShipmentdetailsComponent,
    UserOrderdetailsComponent,
    AwbstatusComponent,
    RtoComponent,
    RtoEditComponent,
    RtoChangeStatusComponent,
    SalesDashboardComponent,
    DaterangeComponent,
    CourierGraphComponent,
    SellerorderGraphComponent,
    SellershipmentsGraphComponent,
    SellercourierGraphComponent,
    UserRtoComponent,
    SalespersonDialogComponent,
    DatepickerComponent,
    EmployeesComponent,
    AddEmployeeComponent,
    BankListComponent,
    AddbankComponent,
    UserShipmentdetailsComponent,
    EditPermissionsComponent,
    HellpbtnComponent,
    VerificationComponent,
    CouriersComponent,
    ManagecourierComponent,
    LoaderComponent,
    RtoUploadComponent,
    EditpriorityComponent,
    ViewcourierComponent,
    IssueticketsComponent,
    IssuedetailsComponent,
    IssuesComponent,
    RtoImportlistComponent,
    RtolistComponent,
    WebhookViewComponent,
    CourierDetailsComponent,
    BillingsComponent,
    BranchOrdersComponent,
    UploadBranchOrdersComponent,
    NszPageComponent,
    PincodeMasterComponent,
    PincodeFileUploadComponent,
    ShipmentContainerComponent,
    UserOrderContainerComponent,
    UserShipmentsContainerComponent,
    InstaOrdersComponent,
    UserInstaOrdersComponent,
    UserInstaShipmentsComponent,
    InstaShipmentComponent,
    InstaOrderListComponent,
    UserInstaOrdersListComponent,
    DatePickerInvoiceComponent,
    ZoneMasterComponent,
    BranchMasterComponent,
    UpdateAddressComponent,
    OldAwbFinderComponent,
    AutomationLogComponent,
    InstaRemkakeComponent,
    BranchMasterFileUploadComponent,
    ZoneMasterFileUploadComponent,
    AddressupdateComponent,
    RemakeFileUploadComponent,
    RemakeDataComponent,
    InstaShipmentExportComponent,
    EditWarehouseComponent,
    RejectionListComponent,
    WebhookLogComponent,
    InstaExceptionsComponent,
    NdrContainerComponent,
    IntakeVsDeliveryComponent,
    CourierTracking,
    DateRangeFilterComponent
  ],
  imports: [
    HttpClientModule,
    MatProgressSpinnerModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MatTooltipModule,
    MatDialogModule,
    ToastrModule.forRoot(),
    MatPaginatorModule,
    MatTableModule,
    MatSelectModule,
    MatOptionModule,
    MatNativeDateModule,
    NgxDaterangepickerMd.forRoot(),
    BsDatepickerModule.forRoot(),
    CourierGraphModule,
    DragDropModule,
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    {
      provide: MatDialogRef,
      useValue: {}
    },
    //provideHttpClient(withInterceptors([customInterceptor])),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
    provideToastr({
      closeButton:true,positionClass:'toast-top-right',
      timeOut:3000
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
