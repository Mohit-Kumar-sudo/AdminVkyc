import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../services/document.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit {
documents: any[] = [];
  selectedDocument: any = null;
  loading = true;
  constructor(private documentService: DocumentService) { }

  ngOnInit() {
    // this.loadDocuments();
  }

  // loadDocuments() {
  //   this.documentService.getDocuments().subscribe(
  //     (data) => {
  //       this.documents = data;
  //       this.loading = false;
  //     },
  //     (error) => {
  //       console.error('Error loading documents:', error);
  //       this.loading = false;
  //     }
  //   );
  // }

  // viewDocument(id: string) {
  //   this.documentService.getDocument(id).subscribe(
  //     (data) => {
  //       this.selectedDocument = data;
  //     },
  //     (error) => {
  //       console.error('Error loading document:', error);
  //     }
  //   );
  // }

  // deleteDocument(id: string) {
  //   if (confirm('Are you sure you want to delete this document?')) {
  //     this.documentService.deleteDocument(id).subscribe(
  //       () => {
  //         this.loadDocuments();
  //         this.selectedDocument = null;
  //       },
  //       (error) => {
  //         console.error('Error deleting document:', error);
  //       }
  //     );
  //   }
  // }

  closeDocument() {
    this.selectedDocument = null;
  }

}
