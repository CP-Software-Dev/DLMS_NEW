export class Disaptchmodal{
    orderIDs: string[] = [];
    courierID: number = 0;
    pickupDatails: PickupDatails | undefined 

}

export class PickupDatails{
    pickup_time: string = '';
    pickup_date: string = '';
    pickup_location: string = '';
    expected_package_count: number = 0;
}
