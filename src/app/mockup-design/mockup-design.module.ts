import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesignComponent } from './design/design.component';
import { ProductsComponent } from './products/products.component';



@NgModule({
  declarations: [
    DesignComponent,
    ProductsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class MockupDesignModule { }
