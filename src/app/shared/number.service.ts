import { Injectable } from '@angular/core';
import { Service } from './models/service';

@Injectable()
export class NumberService {
  constructor() { }

  public validate(number, numberLength: number = 8, regex = null, allowEmpty: boolean = false){
    let validity;
    let length = number.replace(/[^0-9]/g,"").length;
    if(allowEmpty && length == 0)
        validity = '';
    else if(length < numberLength)
        validity = "TOO_SHORT";
    else{
        // Check if number has at least 8 numbers, and starts with +, 4 or 9.
        if(!regex)
          validity = /(^([+][0-9]{8,})|([49][0-9]{7,}))$/.test(number) ? "" : "INVALID";
        else
          validity = regex.test(number) ? '' : 'INVALID';
    }

    return validity;
  }

  public sortServices(services: Array<Service>){
    return services.sort(this.sortService);
  }

  public sortService(a: Service, b: Service){
    return a.service_number > b.service_number ? 1 : -1;
  }
}
