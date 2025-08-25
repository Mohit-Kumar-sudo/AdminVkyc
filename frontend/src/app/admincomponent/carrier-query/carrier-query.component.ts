import { Component, OnInit, ViewChild  } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { CarrierForm, CarrierQueryService } from '../../services/carrier-query/carrier-query.service'; // Import the service
import { saveAs } from 'file-saver';
import { FileService } from '../../services/file/file.service';

@Component({
  selector: 'app-carrier-query',
  templateUrl: './carrier-query.component.html',
  styleUrl: './carrier-query.component.scss'
})
export class CarrierQueryComponent implements OnInit {

  collection: string[] = [];
    p: number = 1;
    itemsPerPage: number = 10;
    getData: any;
    selectedCarrierForm: CarrierForm = { name: '', email: '', countryCode:'', number: '', category: '', linkedin: '',experience: '',resume: '', };
    isDeletingAll = false;  // Flag to disable the button
    @ViewChild('confirmDeleteModal') confirmDeleteModal: any;
    private CarrierFormToDeleteId: string | null = null;  // Store the ID of the carrier to be deleted
  
    constructor(
      private http: HttpClient, 
      private CarrierFormService: CarrierQueryService, 
      private modalService: NgbModal,
      private fileService: FileService
    ) {
      for (let i = 1; i <= 100; i++) {
        this.collection.push(`item ${i}`);
      }
    }

    private getFileExtension(path: string): string | null {
      const parts = path.split('.');
      return parts.length > 1 ? parts.pop()!.toLowerCase() : null;
    }
    
    private getFileName(path: string): string {
      // Handle both Windows and Unix paths
      const normalizedPath = path.replace(/\\/g, '/');
      const parts = normalizedPath.split('/');
      return parts.pop() || 'resume';
    }
  
    ngOnInit() {
      this.fetchAllCarrierForm();
    }
  
    fetchAllCarrierForm() {
      this.CarrierFormService.onCarrierFormGetAll().subscribe(res => {
        this.getData = res;
        console.log(this.getData.length)
      });
    }
  
    getSNo(index: number): number {
      return (this.p - 1) * this.itemsPerPage + index + 1;
    }
  
    editCarrierForm(carrier: CarrierForm, content: any) {
      this.selectedCarrierForm = { ...carrier };
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        if (result === 'Save') {
          this.updateCarrierForm(this.selectedCarrierForm._id!, this.selectedCarrierForm);
        }
      });
    }
  
    updateCarrierForm(id: string, updatedCarrierForm: CarrierForm) {
      this.CarrierFormService.onCarrierFormUpdate(id, updatedCarrierForm).subscribe(res => {
        const index = this.getData.findIndex((c: any) => c._id === id);
        if (index !== -1) {
          this.getData[index] = updatedCarrierForm;
        }
      });
    }
  
    onDelete(id: string) {
      this.CarrierFormToDeleteId = id;
      const modalRef = this.modalService.open(this.confirmDeleteModal, { ariaLabelledBy: 'modal-basic-title' });
      modalRef.result.then((result) => {
        if (result === 'Delete' && this.CarrierFormToDeleteId) {
          this.CarrierFormService.onCarrierFormDelete(this.CarrierFormToDeleteId).subscribe(res => {
            this.fetchAllCarrierForm();
          });
        }
      });
    }
  
    confirmDelete(modal: any) {
      modal.close('Delete');
    }
  
    confirmDeleteAll() {
      const modalRef = this.modalService.open(this.confirmDeleteModal, { ariaLabelledBy: 'modal-basic-title' });
      modalRef.result.then((result) => {
        if (result === 'Confirm') {
          this.confirmDeleteAllAction();
        }
      });
    }
  
    confirmDeleteAllAction() {
      this.isDeletingAll = true;
      setTimeout(() => {
        this.CarrierFormService.onCarrierFormDeleteAll().subscribe(res => {
          this.fetchAllCarrierForm();
          this.isDeletingAll = false;
        });
      }, 10000);
    }

    // Add this helper method
private extractServerFilePath(fullPath: string): string {
  // Convert to forward slashes and extract path after 'uploads/'
  const normalized = fullPath.replace(/\\/g, '/');
  const uploadsIndex = normalized.indexOf('uploads/');
  
  if (uploadsIndex >= 0) {
    return normalized.substring(uploadsIndex + 'uploads/'.length);
  }
  return normalized; // fallback to full path if pattern not found
}

viewResume(resumePath: string) {
  if (!resumePath) {
    console.error('No resume path provided');
    return;
  }
  
  // Log the path for debugging
  console.log('Original resume path:', resumePath);
  
  // Construct the view URL
  const url = this.fileService.view(resumePath);
  console.log('Constructed URL:', url); // Add this for debugging
  
  window.open(url, '_blank');
}

downloadResume(resumePath: string) {
  const url = this.fileService.download(resumePath);
  const link = document.createElement('a');
  link.href = url;
  link.download = resumePath.split('/').pop()!;
  link.click();
}



}
