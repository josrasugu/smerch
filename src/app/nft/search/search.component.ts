import { Component, OnInit, ViewChild,HostListener, AfterViewInit, Directive, ElementRef, Renderer2} from '@angular/core';
import { SystConfig } from '../../config/syst';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import  { ActivatedRoute,  Router, Routes, RouterModule } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})

/*export class AppComponent implements AfterViewInit {

  @ViewChild("myDiv") divView: ElementRef;

  ngAfterViewInit(){

    console.log(this.divView);
    this.divView.nativeElement.innerHTML = "Hello Angular 10!";

  }
}*/
export class SearchComponent implements OnInit, AfterViewInit {

  title = 'smerch-front';
  private apiUrl = SystConfig.apiUrl; 
  serverData : any;
  asset : any;
  assetsView = true;
  assetView = false;
  searchBtn: any;


  searchForm = new FormGroup({
    contractAddress: new FormControl(''),
  });   


  @ViewChild('searchBtnEl') searchBtnEl?: ElementRef;;
  @ViewChild('response') responseEl?: ElementRef;;

  constructor(
    private http: HttpClient,
    private rt: Router,
    private el: ElementRef,
    private elementRef: ElementRef, 
    // private renderer: Renderer2
  ) { }
  ngOnInit(): void {

  }

  ngAfterViewInit() {
    // console.log("Initialised after view");
    // this.searchBtnEl.nativeElement.style.backgroundColor = "blue"; 
    // this.searchBtnEl.nativeElement.innerHTML = "<span class='fa fa-bed fa-spin'></span>"; 
    // this.searchBtn = this.searchBtnEl.nativeElement;
  }  

  fetchAssets(contractAddress? : any){
    this.searchBtnEl.nativeElement.style.width = "200px"; 
    this.searchBtnEl.nativeElement.innerHTML = "<span style='font-size: 36px' class='fa fa-spinner fa-spin'></span>"; 
    this.responseEl.nativeElement.className = "";
    this.responseEl.nativeElement.innerHTML = "";
    this.assetsView = true;
    this.assetView = false;   
    this.getContractAssets(contractAddress).subscribe(
        (val) => {
          this.serverData = val;
          // console.log(this.serverData);
          this.searchBtnEl.nativeElement.style.width = ""; 
          this.searchBtnEl.nativeElement.innerHTML = "Search contract"; 
    },
    response => {
      // response
      this.responseEl.nativeElement.className = "alert alert-danger";
      this.responseEl.nativeElement.innerHTML = "No items found";
      this.searchBtnEl.nativeElement.innerHTML = "Search contract";
    },
    () => {
      // console.log("The observable is now completed.");
      }
    );    
  }

// 0x381748c76f2b8871afbbe4578781cd24df34ae0d
// 0x7dca125b1e805dc88814aed7ccc810f677d3e1db
// 0x911910e4ecc5eef8c1b35cac7c2e159bfa88db59
// 0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656
// 0x86249f2e44b044a2c2303ef3bd17e0840fb5f03b

  getContractAssets(contractAddress? : any){
    var data = this.http.get(this.apiUrl + '/assets?asset_contract_address=' + contractAddress);  
    return data;
  }
  getAsset(contractAddress? : any, id? : any){
    var data = this.http.get(this.apiUrl + '/asset/' + contractAddress + '/' + id);  
    return data;   
  }  
  assetSelected(contractAddress? : any, id? : any){
    // console.log(contractAddress, id);
    this.getAsset(contractAddress, id).subscribe(
        (val) => {
          this.asset = val;
          // console.log(this.asset);
          this.assetsView = false;
          this.assetView = true;
    },
    response => {

    },
    () => {
      // console.log("The observable is now completed.");
      }
    );   
  }

  contractAssets(){
    var items = this.searchForm.value;
    this.serverData = {};
    this.fetchAssets(items.contractAddress);
  }
  
  printProducts(address? : any, token_id? : any){
    this.rt.navigate(['/products/' + address + '/' + token_id]);
  }
}
