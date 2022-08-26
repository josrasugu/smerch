import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DesignComponent } from './mockup-design/design/design.component';
import { ProductsComponent } from './mockup-design/products/products.component';
import { SearchComponent } from './nft/search/search.component';

const routes: Routes = [
  {
    path: '',
    component: SearchComponent
  },
  {
    path: 'design/:productId/:address/:token',
    component: DesignComponent
  },
  {
    path: 'products/:address/:token',
    component: ProductsComponent
  },
    {
    path: 'nft-search',
    component: SearchComponent
  },  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
