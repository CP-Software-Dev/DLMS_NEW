export class Webhookmodel {
    id: number = 0;
    sellerId: number = 0;
    name: string = "";
    token: string = "";
    url: string = "";
    createdBy: string = "";
    createdAt: Date = new Date();
    modifiedAt: Date = new Date();
    isActive: number = 0;
}
