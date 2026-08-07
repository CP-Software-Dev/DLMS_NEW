import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  //public readonly BaseURL = 'http://sandbox.cp-logistics.co.in/api'
  //public readonly BaseURL = 'http://192.168.51.89/api';
  public readonly BaseURL = "https://ship.cp-logistics.co.in:8011/api";
  //public readonly BaseURL = 'http://192.168.5.162:803/api';
  //public readonly BaseURL = "http://localhost:809/api";
  //public readonly BaseURL = "http://localhost:5022/api";

  //Admin
  public readonly Users = this.BaseURL + "/Admin/Users";
  public readonly CreateUser = this.BaseURL + "/Admin/user";
  public readonly ConfirmRegistration =
    this.BaseURL + "/Admin/ConfirmRegistration";
  public readonly Activate = this.BaseURL + "/Admin/ActivateDeactivate";

  //Authorize
  public readonly GenerateOtp = this.BaseURL + "/Authorize/Authorize";
  public readonly GenerateToken = this.BaseURL + "/Authorize/GenerateToken";

  //Courier
  public readonly CourierData = this.BaseURL + "/Courier/Courier";
  public readonly CourierDataAdmin = this.BaseURL + "/Courier/CourierDetails";
  public readonly CourierCredentials =
    this.BaseURL + "/Courier/GetCourierCredentials";
  public readonly ManageCredentials =
    this.BaseURL + "/Courier/EditCourierCredentials";
  public readonly CourierPriority = this.BaseURL + "/Courier/CourierPriority";
  public readonly StockDetails =
    this.BaseURL + "/Courier/GetIndiapostTokenSeries";

  //Dashboard
  public readonly Dashboard = this.BaseURL + "/Dashboard/Dashboard";

  //Exceptions
  public readonly Exceptions = this.BaseURL + "/Exception/Exception";

  //Institution
  public readonly BankList = this.BaseURL + "/Institution/Institutions";
  public readonly AddBank = this.BaseURL + "/Institution/Institution";

  //Orders
  public readonly UploadOrders = this.BaseURL + "/Orders/Upload";
  public readonly RejectOrder = this.BaseURL + "/Orders/RejectOrder";
  public readonly ImportList = this.BaseURL + "/Orders/Imports";
  public readonly Orders = this.BaseURL + "/Orders/Orders";
  public readonly OrdersExport = this.BaseURL + "/Orders/ExportData";
  public readonly OrdersFileExport = this.BaseURL + "/Orders/FileExport";
  public readonly InstaOrders = this.BaseURL + "/Orders/InstaOrders";
  public readonly OrderCreation = this.BaseURL + "/Orders/Book";
  public readonly ChangeStatus = this.BaseURL + "/Orders/Status";
  public readonly ExportFile = this.BaseURL + "/Orders/Export";
  public readonly OrderDetails = this.BaseURL + "/Orders/Search";
  public readonly ShipmentByFile = this.BaseURL + "/Shipment/ShipmentByFile";

  //Bramch Orders

  public readonly uploadbBranchOrders = this.BaseURL + "/BranchOrders/Upload";
  public readonly branchOrders = this.BaseURL + "/BranchOrders/Orders";

  //RTO
  public readonly RtoStatus = this.BaseURL + "/RTO/Status";
  public readonly RtoOrders = this.BaseURL + "/RTO/RtoOrders";
  public readonly EditDetails = this.BaseURL + "/RTO/Edit";
  public readonly ChangeRtoStatus = this.BaseURL + "/RTO/UpdateStatus";
  public readonly ConfirmRto = this.BaseURL + "/RTO/ConfirmRto";
  public readonly ProcessRtoData = this.BaseURL + "/RTO/SendToOrder";
  public readonly RtoUpload = this.BaseURL + "/Rto/FileUpload";
  public readonly RtoImportList = this.BaseURL + "/RTO/ImportData";
  public readonly ExportRtoFile = this.BaseURL + "/RTO/File";

  //Sales
  public readonly SalesPerson = this.BaseURL + "/Sales/SalesPerson";
  public readonly AddSalesPerson = this.BaseURL + "/Sales/SalesPerson";
  public readonly EditSalesPerson = this.BaseURL + "/Sales/SalesPersons";
  public readonly RaiseIssue = this.BaseURL + "/Sales/Mail";
  public readonly Issues = this.BaseURL + "/Sales/SupportTickets";

  //Seller
  public readonly SellerData = this.BaseURL + "/Seller/Seller";

  //Shipment
  public readonly Shipments = this.BaseURL + "/Shipment/Shipment";
  public readonly ShipmentsExport = this.BaseURL + "/Shipment/Export";
  public readonly ShipmentsFileExport = this.BaseURL + "/Shipment/FileExport";
  public readonly Remake = this.BaseURL + "/Shipment/UpdateRemake";
  public readonly CsvRemake = this.BaseURL + "/Shipment/UpdateRemakeFromCsv";
  public readonly AWBStatus = this.BaseURL + "/Shipment/Track";
  public readonly OLDAWBStatus = this.BaseURL + "/Bluedart/OrderTracking";
  public readonly UpdateNSZ = this.BaseURL + "/Shipment/UpdateNsz";

  //Status
  public readonly StatusData = this.BaseURL + "/Status/Status";

  //User
  public readonly ChangePassword = this.BaseURL + "/User/ChangePassword";
  public readonly ForgotPassword = this.BaseURL + "/User/ForgotPassword";
  public readonly UpdatePassword = this.BaseURL + "/User/UpdatePassword";
  public readonly EditPermission = this.BaseURL + "/User/Permission";

  //Warehouse
  public readonly Warehouse = this.BaseURL + "/Warehouse/Warehouse";
  public readonly CreateWarehouse = this.BaseURL + "/Warehouse/AddWarehouse";
  public readonly UpdateWarehouse = this.BaseURL + "/Warehouse/UpdateWarehouse";

  //Webhook
  public readonly Webhooks = this.BaseURL + "/Webhook/Webhooks";
  public readonly CreateWebhook = this.BaseURL + "/Webhook/Create";
  public readonly EditWebhook = this.BaseURL + "/Webhook/Update";
  public readonly CallWebhook = this.BaseURL + "/Webhook/CallWebhook";
  public readonly DeleteWebhook = this.BaseURL + "/Webhook/Delete";
  public readonly CancelOrder = this.BaseURL + "/Delhivery/Cancel";
  public readonly OrderJourney = this.BaseURL + "/Webhook/OrderWebhook";

  public readonly InvoiceDataFilter =
    this.BaseURL + "/InvoiceSummary/GetInvoiceReport";
  public readonly InstaInvoiceDataFilter =
    this.BaseURL + "/InvoiceSummary/GetInstaInvoiceReport";
  public readonly Invoice = this.BaseURL + "/InvoiceSummary/GetInvoiceSummary";
  public readonly InstaInvoice =
    this.BaseURL + "/InvoiceSummary/GetInstaInvoiceSummary";

  //Pincode Master

  public readonly PincodeMaster =
    this.BaseURL + "/PincodeManager/GetPincodeMaster";
  public readonly PincodeFileUpload = this.BaseURL + "/PincodeManager/Upload";

  public readonly BranchMaster =
    this.BaseURL + "/BranchManager/GetBranchMaster";
  public readonly BranchFileUpload = this.BaseURL + "/BranchManager/Upload";

  public readonly ZoneMasterUpload = this.BaseURL + "/ZoneManager/Upload";
  public readonly ZoneMaster = this.BaseURL + "/ZoneManager/GetZoneMaster";

  public readonly AwbMapping = this.BaseURL + "/AwbMapping/Upload";

  public readonly OrderSearch = this.BaseURL + "/UpdateAddress/OrderDetail";
  public readonly AddressUpdate = this.BaseURL + "/UpdateAddress/Update";

  public readonly AutomationFilesView = this.BaseURL + "/AutomationLog/files";
  public readonly AutomationFilesDownload =
    this.BaseURL + "/AutomationLog/download";

  public readonly WebhookFilesView = this.BaseURL + "/AutomationLog/webhookfiles";
  public readonly WebhookFilesDownload =
    this.BaseURL + "/AutomationLog/webhookdownload";

  public readonly RemakeOrders = this.BaseURL + "/Orders/RemakeOrders";
  public readonly RejectedOrders = this.BaseURL + "/Orders/RejectedOrders";

  public readonly AssignManualIPawb = this.BaseURL + "/Awb";

  constructor() {}
}
