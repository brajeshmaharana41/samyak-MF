<form [formGroup]="form" (ngSubmit)="save()" class="dialog-form">
  <label for="name">Name</label>
  <input id="name" pInputText formControlName="name" />

  <label for="category">Category</label>
  <input id="category" pInputText formControlName="category" />

  <div class="buttons">
    <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="ref.close()" />
    <p-button type="submit" label="Save" icon="pi pi-check" [disabled]="form.invalid" />
  </div>
</form>
