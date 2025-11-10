import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'startOnlyWithAlphabets' })
export class StartOnlyWithAlphabetsPipe implements PipeTransform {
    
  transform(data: any) : any {
    let data1 = data.replace(/[0-9]+/, '');
      return data1;
  }
}