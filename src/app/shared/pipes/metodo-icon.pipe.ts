import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transforma un método de pago en el nombre de ícono de Material Icons.
 *
 * Uso en template: {{ row.metodoPago | metodoIcon }}
 */
@Pipe({
  name: 'metodoIcon',
  standalone: true,
})
export class MetodoIconPipe implements PipeTransform {
  transform(metodo: string): string {
    switch (metodo) {
      case 'EFECTIVO':      return 'payments';
      case 'YAPE':
      case 'PLIN':          return 'phone_iphone';
      case 'TRANSFERENCIA': return 'account_balance';
      default:              return 'payments';
    }
  }
}