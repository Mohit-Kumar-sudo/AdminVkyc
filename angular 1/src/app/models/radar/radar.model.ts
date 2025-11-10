
export class RadarModules{
    name : String;
    threatOfNewEntrantsRating : Number;
    bargainingPowerOfSuppliersRating : Number;
    threatOfSubstitutesRating : Number;
    bargainingPowerOfBuyersRating : Number;
    segmentRivalryRating : Number;

    constructor(jsonObject : any){
      this.name = jsonObject.name;
              this.threatOfNewEntrantsRating = jsonObject.threatOfNewEntrantsRating;
              this.bargainingPowerOfSuppliersRating = jsonObject.bargainingPowerOfSuppliersRating;
              this.threatOfSubstitutesRating = jsonObject.threatOfSubstitutesRating;
              this.bargainingPowerOfBuyersRating = jsonObject.bargainingPowerOfBuyersRating;
              this.segmentRivalryRating = jsonObject.segmentRivalryRating;          
    }
}