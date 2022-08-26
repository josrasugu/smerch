import { Component, OnInit } from '@angular/core';
import { SystConfig } from '../../config/syst';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import  { ActivatedRoute,  Router, Routes, RouterModule } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  title = 'smerch-front';
  private apiUrl = SystConfig.apiUrl; 
  private apiPrintfulUrl = SystConfig.apiPrintfulUrl; 
  productItems = SystConfig.products; 
  products: any[] = []; 
  serverData : any;
  // products : any;
  generatedHeader: any;
  contractAddress: any;
  tokenId: any;
  asset: any;
  genHeders(token_key? : any){
    this.generatedHeader = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*', 
        'Authorization' : token_key,
      })
    }
    return this.generatedHeader;
  }
  
  productSearchForm = new FormGroup({
    searchWord: new FormControl(''),
  });

  constructor(
    private http: HttpClient,
    private rt: Router,
    private route: ActivatedRoute,
    ) { }
  ngOnInit(): void {
    // this.fetchProducts();
    let self = this;
    this.productItems.result.forEach(function(product? : any){
      let techniqueApproved = false;
      product.techniques.forEach(function(technique? : any){
        if(technique.key == "SUBLIMATION" || technique.key == "DTG" || technique.key == "DIGITAL"){
          techniqueApproved = true;
        }
      })
      if(techniqueApproved){
        self.products.push(product);
      }
    });

    this.route.params.subscribe(params=>{
      this.contractAddress = params["address"];
      this.tokenId = params["token"];
      this.getAsset(this.contractAddress, this.tokenId).subscribe(
          (val) => {
            this.asset = val;
            console.log(this.asset);

      },
      response => {

      },
      () => {
        // console.log("The observable is now completed.");
        }
      );
    })

  }

  fetchProducts(){
    // console.log("Fetch data");
    this.getProducts().subscribe(
        (val) => {
          this.serverData = val;
          console.log(this.serverData);
    },
    response => {

    },
    () => {
      // console.log("The observable is now completed.");
      }
    );    
  }

  getAsset(contractAddress? : any, id? : any){
    var data = this.http.get(this.apiUrl + '/asset/' + contractAddress + '/' + id);  
    return data;   
  } 

  getProducts(){
    var data = this.http.get(this.apiPrintfulUrl + '/products', this.genHeders('Bearer sWVhv4L9sI5PTh3VPRULd0pvYcMoQl3hWrrVegk0'));  
    return data;
  }

  searchProducts(){
    console.log("Searching...");
  }

  productSelected(productId? : any){
    // console.log(productId);
    this.rt.navigate(['/design/' + productId + '/' + this.contractAddress + '/' + this.tokenId]);
  }

}
