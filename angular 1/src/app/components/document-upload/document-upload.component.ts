import { Component } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class DocumentUploadComponent {
  selectedFile: File | null = null;
  uploading = false;
  uploadResult: any = null;
  sectionContent: string = '';
  currentSection: string = '';
  reportId: any = ''; // Example report ID

  constructor(private documentService: DocumentService,
              private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
  // ✅ Get reportId from the route path
  this.route.paramMap.subscribe(params => {
    this.reportId = params.get('id');
    console.log('Report ID from path params:', this.reportId);
  });
}

  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.documentService.uploadDocument(this.selectedFile).subscribe(
      (res) => {
        this.uploadResult = res;
        console.log('Upload successful:', this.uploadResult);
        this.uploading = false;
      },
      (err) => {
        console.error(err);
        this.uploading = false;
      }
    );
  }

  getSection(section: string) {
    if (!this.uploadResult) return;
    console.log(`Requesting section: ${section}`);
    this.documentService.getSection(this.uploadResult.documentId, section,this.reportId).subscribe(
      (res) => {
        this.currentSection = section;
        this.sectionContent = res.content;
      },     
      (err) => console.error(err)
    );
  }
}
