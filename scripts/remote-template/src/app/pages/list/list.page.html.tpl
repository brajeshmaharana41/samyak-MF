<samyak-page-header [title]="info.listTitle" [subtitle]="info.title" />
<samyak-data-table [columns]="columns" [data]="store.all()" [actions]="actions" (actionClick)="onAction($event)" />
