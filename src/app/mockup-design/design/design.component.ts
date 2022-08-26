import { Component, OnInit, ViewChild,HostListener, ElementRef, AfterViewInit, Renderer2, Inject } from '@angular/core';
// import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import  { ActivatedRoute,  Router, Routes, RouterModule } from '@angular/router';
import { SystConfig } from '../../config/syst';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  data: any;
  task_id: any;
}

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.css']
})
export class DesignComponent implements OnInit, AfterViewInit {
  private htmlEl: any;
  private context: any;
  productId: any;
  dragging = false;
  designSelected = false;
  resize = false;
  resizeDrag = false;
  lastX = 0;
  lastY = 0;
  marginLeft = 0;
  marginTop = 0;
  canvasoffsetLeft = 0;
  canvasoffsetTop = 0;
  placementX = 0;
  placementY = 0;
  designImgOriginalWidth = 0;
  designImgOriginalHeight = 0;
  designImgWidth = 0;
  designImgHeight = 0;
  designImgScale = 1;
  serverData: any;
  templatesData: any;
  templates: any;
  variantId: any;
  template: any;
  asset: any;
  designImage: any;
  designImgTransparency = false;

  variantColors: any[] = []; 
  variantSizes: any[] = [];

  selectedColors: any[] = [];
  selectedSizes: any[] = [];
  templateImgScale: any;

  printAreaHeight: any;
  printAreaWidth: any;
  printAreaX: any;
  printAreaY: any;
  ratioScale = 0;
  mockupGeneratorResponse: any;

  bgRemovedResponse: any;

  private apiUrl = SystConfig.apiUrl; 
  private apiPrintfulUrl = SystConfig.apiPrintfulUrl; 
  // private context: CanvasRenderingContext2D;

  generatedHeader: any;
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

  @ViewChild('canvasEl')
  private canvasEl: ElementRef = {} as ElementRef;
  @ViewChild('templates') templatesEl?: ElementRef;
  @ViewChild('designImgEl') designImgEl?: ElementRef;
  @ViewChild('designLoadingEl') designLoadingEl?: ElementRef;

  constructor(    
    private renderer: Renderer2,
    private el: ElementRef,
    private route: ActivatedRoute,
    private http: HttpClient,
    public dialog: MatDialog

    ) { }
  ngOnInit(): void {

  }

  ngAfterViewInit() {
    // console.log(this.template);
    this.route.params.subscribe(params=>{
      this.productId = params['productId'];
      this.getAsset(params['address'], params['token']).subscribe(
          (val) => {
            this.asset = val;
            this.designImage = this.asset.image_url;
            // console.log(this.asset);
            // this.assetsView = false;
            // this.assetView = true;
      },
      response => {

      },
      () => {
        // console.log("The observable is now completed.");
        }
      );  

      this.getProduct(params['productId']).subscribe(
          (val) => {
            this.serverData = val;
            console.log(this.serverData);
            let self = this;
            this.serverData.result.variants.forEach(function(variant? : any){
              var checkColorExist = false;
              var checkSizeExist = false;
              for (let c = 0; c < self.variantColors.length; c++) {
                if(self.variantColors[c] == variant.color_code){
                  checkColorExist = true;
                }
              } 

              for (let s = 0; s < self.variantSizes.length; s++) {
                if(self.variantSizes[s] == variant.size){
                  checkSizeExist = true;
                }
              } 

              if(!checkColorExist){
                self.variantColors.push(variant.color_code);
              }
              if(!checkSizeExist){
                self.variantSizes.push(variant.size);
              }
            });
            console.log(this.variantColors, this.variantSizes);
            // variantColors
            // variantSizes
      },
      response => {

      },
      () => {
        // console.log("The observable is now completed.");
        }
      );      

      this.getProductTemplates(params['productId']).subscribe(
          (val) => {
            this.templatesData = val;
            this.templates = this.templatesData.result.variant_mapping[0].templates;
            this.templates[0].selected = true;
            this.variantId = this.templatesData.result.variant_mapping[0].variant_id;
            var templateId = this.templatesData.result.variant_mapping[0].templates[0].template_id;
            this.selectedColors.push('');
            this.selectedSizes.push('');

            console.log(this.templates);
            console.log(this.templatesData);

            let self = this;
            this.templatesData.result.templates.forEach(function(template? : any){
              if(template.template_id == templateId){
                self.template = template;
                console.log(self.template);
                self.templatePlacement(self.template.image_url, self.template.background_color);
              }
            })
      },
      response => {

      },
      () => {
        // console.log("The observable is now completed.");
        }
      );      
      // https://api.printful.com/products/362
    });          
  }

  getAsset(contractAddress? : any, id? : any){
    var data = this.http.get(this.apiUrl + '/asset/' + contractAddress + '/' + id);  
    return data;   
  }

  templatePlacement(templateUrl? : any, color? : any){
    console.log(this.template);
    this.getBase64FromUrl(templateUrl).then((b64Img) =>{
      this.htmlEl = this.canvasEl.nativeElement as HTMLCanvasElement;
      this.templateImgScale = 500/this.template.template_width;
      this.htmlEl.width = this.templateImgScale * this.template.template_width;
      this.htmlEl.height = this.templateImgScale * this.template.template_height;
      this.htmlEl.style.background = color + " url('" + b64Img +"') left top/" + 500 + "px auto no-repeat";
      this.context = this.htmlEl.getContext('2d');
      this.drawWindows();
    });
  }

  switchVariant(variantIndex? : any, color? : any, size? : any){
    this.designImgWidth = 0;
    this.designImgHeight = 0;

    if(variantIndex != 'NULL'){
      this.templates = this.templatesData.result.variant_mapping[variantIndex].templates;
      this.templates[0].selected = true;
      this.variantId = this.templatesData.result.variant_mapping[variantIndex].variant_id;
      var templateId = this.templatesData.result.variant_mapping[variantIndex].templates[0].template_id;
    }

    let self = this; 
    if(color != 'NULL'){
      this.selectedColors.push(color);
      var latestColor = this.selectedColors.slice(-1);
      this.templatesData.result.templates.forEach(function(template? : any){
        if(template.background_color == latestColor){
          // templateId = template.template_id;
            for (let vm = 0; vm < self.templatesData.result.variant_mapping.length; vm++) {
              for (let t = 0; t < self.templatesData.result.variant_mapping[vm].templates.length; t++) {
                if(self.templatesData.result.variant_mapping[vm].templates[t].template_id == template.template_id){
                  self.templates = self.templatesData.result.variant_mapping[vm].templates;
                  self.variantId = self.templatesData.result.variant_mapping[vm].variant_id;
                  templateId = self.templatesData.result.variant_mapping[vm].templates[0].template_id;
                  // console.log(self.templatesData.result.variant_mapping[vm].variant_id);
                  // break;
                }
              }
          } 
        }
      })  
    }

    if(size != 'NULL'){
      this.selectedSizes.push();
    // var latestSize = this.selectedSizes.slice(-1);
    }


    this.templatesData.result.templates.forEach(function(template? : any){
      if(template.template_id == templateId){
        self.template = template;
        self.templatePlacement(self.template.image_url, self.template.background_color);
      }
    })    
  }

  switchTemplate(templateId? : any, itemIndex? : any){
    // console.log(this.templatesEl.nativeElement);
    this.designImgWidth = 0;
    this.designImgHeight = 0;
    this.placementX = 0;
    this.placementY = 0;
    this.ratioScale = 0;
    let self = this;
    this.templatesData.result.templates.forEach(function(template? : any){
      if(template.template_id == templateId){
        self.template = template;
        self.templatePlacement(self.template.image_url, self.template.background_color);
      }
    })
    for (let t = 0; t < this.templates.length; t++) {
      if(t==itemIndex){
        this.templates[t].selected = true;
      }else{
        this.templates[t].selected = false;
      }
    }
  }  

  getBase64FromUrl = async (url? : any) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = () => {
        const base64data = reader.result;   
        resolve(base64data);
      }
    });
  }


  getProduct(id? : any){
    return this.http.post('https://dev.smerch.io/printful.php', {
      "fetch":"product-details",
      "product_id":id,
      "store_id":"8410045"
    });
  }

  getProductTemplates(productId? : any){
    return this.http.post('https://dev.smerch.io/printful.php', {
      "fetch":"product-templates",
      "product_id":productId,
      "store_id":"8410045"
    });
  }

  generateMockupPost(info? : any){
    return this.http.post('https://dev.smerch.io/printful.php', {
      "fetch":"generate-mockup",
      "info":info
    });
  }

  mouseDown(e? : any) {
    if(this.resize){
      this.dragging = false;
      this.resizeDrag = true;
    }else{
      this.dragging = true;
      this.resizeDrag = false;
    }
    const rect = this.htmlEl.getBoundingClientRect();
    var mx = Math.floor(e.clientX-rect.left);
    var my = Math.floor(e.clientY-rect.top);
    this.designSelect(mx, my);

  }
  mouseUp(e? : any){
    this.dragging = false;
    this.resizeDrag = false;
  }

  onMouseMove(e? : any){
    var evt = e || event;
    var deltaX = evt.clientX - this.lastX;
    var deltaY = evt.clientY - this.lastY;
    this.lastX = evt.clientX;
    this.lastY = evt.clientY;

    if(this.dragging){
      // console.log("Mouse move");
      this.placementX += deltaX;
      this.placementY += deltaY;
      this.drawWindows();
    }


    if(this.designSelected){
      const rect = this.htmlEl.getBoundingClientRect();
      var mx = Math.floor(e.clientX-rect.left);
      var my = Math.floor(e.clientY-rect.top);  
      if(!this.resizeDrag){
        this.resize = this.inDrawing(mx,my,[this.placementX + (this. designImgWidth * this. designImgScale) - 10,this.placementY + (this.designImgHeight * this.designImgScale) - 10, this.placementX + (this.designImgWidth * this.designImgScale), this.placementY + (this.designImgHeight * this.designImgScale)]);
      }    
      // console.log(this.resize);
      if(this.resize){
        this.htmlEl.style.cursor = "nw-resize";
      }else{
        this.htmlEl.style.cursor = "default";
      }
    }
    if(this.resize == true && this.resizeDrag  == true){
      // this.designImgHeight += deltaY;
      this.designImgWidth += deltaX;
      this.ratioScale = this.designImgWidth / this.designImgOriginalWidth;
      this.designImgHeight = this.ratioScale * this.designImgOriginalHeight;

      this.drawWindows();
    }
  }

  drawWindows(){
    this.context.clearRect(0,0,800,700);
    var img = new Image();
    let self = this;

    img.addEventListener("load", function() {
      if(self.resize){
        self.paintSelect();
      }else{
        if(self.designImgWidth == 0 && self.designImgHeight == 0){
            self.printAreaHeight = self.template.print_area_height * self.templateImgScale;
            self.printAreaWidth = self.template.print_area_width * self.templateImgScale;
            self.printAreaX = self.template.print_area_left * self.templateImgScale;
            self.printAreaY = self.template.print_area_top * self.templateImgScale;
            
            for (let t = 0; t < self.templates.length; t++) {
                if(self.templates[t].template_id == self.template.template_id){
                  if(self.templates[t].placement_x != undefined){
                    self.placementX = self.templates[t].placement_x;
                    self.placementY = self.templates[t].placement_y;
                    self.ratioScale = self.templates[t].ratio_scale;
                  }else{
                    self.placementX = self.template.print_area_left * self.templateImgScale;
                    self.placementY = self.template.print_area_top * self.templateImgScale;
                    self.ratioScale = (self.printAreaWidth/this.naturalWidth);
                    self.templates[t].placement_x = self.placementX;
                    self.templates[t].placement_y = self.placementY;
                    self.templates[t].ratio_scale = self.ratioScale;
                    self.templates[t].original_ratio_scale = self.ratioScale;
                    self.templates[t].template_img_scale = self.templateImgScale;
                    self.templates[t].variant_id = self.variantId;
                    self.templates[t].original_img_width = this.naturalWidth;
                    self.templates[t].original_img_height = this.naturalHeight;
                    self.templates[t].img_width = this.naturalWidth * self.ratioScale;
                    self.templates[t].img_height = this.naturalHeight * self.ratioScale;
                  }
                }
            } 
            self.designImgOriginalWidth = this.naturalWidth;
            self.designImgOriginalHeight = this.naturalHeight;
            self.designImgWidth = this.naturalWidth * self.ratioScale;
            self.designImgHeight = this.naturalHeight * self.ratioScale;
        }
      }
      // console.log(self.placementX, self.placementY);
      // console.log(self.placementX/self.templateImgScale, self.placementY/self.templateImgScale);
      for (let t = 0; t < self.templates.length; t++) {
          if(self.templates[t].template_id == self.template.template_id){
              self.templates[t].placement_x = self.placementX;
              self.templates[t].placement_y = self.placementY;
              self.templates[t].ratio_scale = self.ratioScale;
              self.templates[t].template_img_scale = self.templateImgScale;
              self.templates[t].variant_id = self.variantId;
              self.templates[t].original_img_width = this.naturalWidth;
              self.templates[t].original_img_height = this.naturalHeight;
              self.templates[t].img_width = this.naturalWidth * self.ratioScale;
              self.templates[t].img_height = this.naturalHeight * self.ratioScale;          
          }
      }
      // console.log(self.designImgWidth, self.designImgHeight);
      self.context.drawImage(img, self.placementX, self.placementY, self.designImgWidth * self.designImgScale, self.designImgHeight * self.designImgScale);
      self.context.setLineDash([6]);
      var invertedHighlight = "#" + self.invertHex(self.template.background_color.substring(1));
      self.context.strokeStyle = invertedHighlight;
      self.context.strokeRect(self.printAreaX, self.printAreaY, self.printAreaWidth, self.printAreaHeight);
    });
    img.src = this.designImage;
  }
  invertHex(hex) {
    return (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
  }
  designSelect(x? : any, y? : any){
    // var checkPoint = inDrawing(x,y,[minX, minY, maxX, maxY]);
    var checkPoint = this.inDrawing(x,y,[this.placementX,this.placementY, this.placementX + (this.designImgWidth * this.designImgScale), this.placementY + (this.designImgHeight * this.designImgScale)]);
    if(checkPoint){
      this.designSelected = true;
      this.paintSelect();
    }else{
      this.designSelected = false;
    }
  }
  paintSelect(){
      this.context.setLineDash([6]);
      var invertedHighlight = "#" + this.invertHex(this.template.background_color.substring(1));
      this.context.strokeStyle = invertedHighlight;      
      this.context.strokeRect(this.placementX,this.placementY, (this.designImgWidth * this.designImgScale), (this.designImgHeight * this.designImgScale));
      this.context.fillStyle = invertedHighlight;
      this.context.fillRect(this.placementX + (this.designImgWidth * this.designImgScale) - 10,this.placementY + (this.designImgHeight * this.designImgScale) - 10, 10, 10);
  }

  inDrawing(x? : any, y? : any, rect? : any){
    if (x >= rect['0'] && x <= rect['2'] && y >= rect['1'] && y <= rect['3']) {
      return true;
    }else{
      return false;
    }
  }

  generateMockup(){
/*    console.log(this.template);
    console.log(this.ratioScale);
    console.log(this.templates);*/
  console.log(this.templatesData);
  let self = this;
  let variant_ids: any[] = [];
  let files: any[] = [];
  this.templatesData.result.templates.forEach(function(template? : any){
    for (let t = 0; t < self.templates.length; t++) {
      if(template.template_id == self.templates[t].template_id){
        var fixRatio = self.templates[t].img_width/(self.templates[t].original_img_width*self.templates[t].original_ratio_scale);
        var fixWidth = template.template_width * fixRatio;
        var fixHeight = template.template_height * fixRatio;
        var top = (self.templates[t].placement_y / self.templates[t].template_img_scale)-template.print_area_top;
        var left = (self.templates[t].placement_x / self.templates[t].template_img_scale)-template.print_area_left;

        if(!isNaN(top)){
          variant_ids.push(self.templates[t].variant_id);
          var dImgUrl = "";
          if(self.designImgTransparency){
            dImgUrl = "http://3.237.28.153:5000/?url=" + self.asset.image_url;
          }else{
            dImgUrl = self.designImage;
          }

          files.push({
                "placement": self.templates[t].placement,
                "image_url": dImgUrl,
                "position": {
                  "area_width": template.template_width,
                  "area_height": template.template_height,
                  "width": fixWidth,
                  "height": fixHeight,
                  "top": top,
                  "left": left
                }
              });
        }
        // console.log(self.templates[t].placement_y / self.templates[t].template_img_scale, template.print_area_top, top);
        // console.log(self.templates[t].placement_x / self.templates[t].template_img_scale, template.print_area_left, left);
      }
    }


  })
  // console.log(files);
  if(variant_ids.length !== 0 && files.length  !== 0){
    var postData =  {
      "store_id":8410045,
      "product_id":self.productId,
        "variant_ids": variant_ids,
        "format": "jpg",
        "files": files 
      };          
      self.generateMockupPost(postData).subscribe(
          (val) => {
            self.mockupGeneratorResponse = val;
            this.fetchPreviewMockup(self.mockupGeneratorResponse.result.task_key);
      },
      response => {

      },
      () => {
        // console.log("The observable is now completed.");
        }
      );
  }

  // :::::::::::::::::::::::::::::::::::::::::::::::::::
  }

  fetchPreviewMockup(taskId? :any){
    const dialogRef = this.dialog.open(MockupDialog, {
      width: "100%",
      data: {task_id: taskId}
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.getTemplates(this.screenId)
    });  
  }

  transparencySwitch(e){
    // designImg
    if(e.checked){
      this.designImgTransparency = true;
      this.designLoadingEl.nativeElement.style.display = "block";
      this.designImgEl.nativeElement.style.display = "none";
      this.getBase64FromUrl("http://3.237.28.153:5000/?url=" + this.asset.image_url).then((b64Img) =>{
        this.designLoadingEl.nativeElement.style.display = "none";
        this.designImgEl.nativeElement.style.display = "block";
        this.designImgEl.nativeElement.src = "/assets/imgs/transparency-bg.webp";
        // this.designImage = "/assets/imgs/transparency-bg.webp";
        this.designImgEl.nativeElement.src = b64Img;
        this.designImage = b64Img;
        this.drawWindows();
      });        
    }else{
      this.designImgTransparency = false;
      this.designImgEl.nativeElement.src = this.asset.image_url;
      this.designImage = this.asset.image_url;
      this.drawWindows();
    }
  }

  removeBg(url? : any,){
    var data = this.http.get(url);  
    return data;   
  }  
}

@Component({
  selector: 'mockup-dialog',
  templateUrl: 'mockup-dialog.html',
})

export class MockupDialog implements OnInit, AfterViewInit {
  serverData: any;
  refreshIntervalId: any;
  @ViewChild('generateIconEl') generateIconEl?: ElementRef;
  @ViewChild('generateTextEl') generateTextEl?: ElementRef;
  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef,
    public dialog: MatDialog,   
    private http: HttpClient,
  // private dt: PresentationService,
    public dialogRef: MatDialogRef<MockupDialog>,
  @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }
  ngAfterViewInit() {
    let self = this;
    this.refreshIntervalId = setInterval(function () {
        self.getMockupResults(self.data.task_id).subscribe(
          (val) => {
            self.serverData = val;
            if(self.serverData.result.status == "completed"){
              self.clearMockupCheck();
            }
          self.generateIconEl.nativeElement.className = "";
          self.generateIconEl.nativeElement.className = "fa fa-check-circle-o";
          self.generateIconEl.nativeElement.style.color = "green";
          self.generateIconEl.nativeElement.style.fontSize = "30px";
          self.generateTextEl.nativeElement.fontSize = "40px";     
          self.generateTextEl.nativeElement.innerHTML = "Generated successfully";     

        },
        response => {

        },
          () => {
          // console.log("The observable is now completed.");
          }
        );
      }, 3000);
  }
  clearMockupCheck(){
    clearInterval(this.refreshIntervalId);
  }
  getMockupResults(taskId? : any){
    return this.http.post('https://dev.smerch.io/printful.php', {
      "fetch":"check-mockup-task",
      "info":{"task_id": taskId}
    });
  }
}