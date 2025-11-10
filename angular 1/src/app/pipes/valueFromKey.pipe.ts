import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'valueFromKey' })
export class ValueFromKeyPipe implements PipeTransform {
    
  transform(data: any) : any {
    let returnData = [];
      data.forEach(e => {
          e.value.forEach(e => {
              returnData.push(e)
          })         
      });
      return returnData;
  }
}