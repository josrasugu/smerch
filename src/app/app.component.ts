import { Component } from '@angular/core';
import { SystConfig } from './config/syst';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {FormBuilder, FormGroup, FormControl } from '@angular/forms';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  constructor(private http: HttpClient) { }
  ngOnInit(): void {

  }


}
