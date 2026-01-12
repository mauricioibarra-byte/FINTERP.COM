export class RutUtils {
    static clean(rut: string): string {
        return rut.replace(/[^0-9kK]/g, '');
    }

    static format(rut: string): string {
        const cleanRut = this.clean(rut);
        if (cleanRut.length <= 1) return cleanRut;

        let body = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1).toUpperCase();

        // Add dots
        body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return `${body}-${dv}`;
    }

    static validate(rut: string): boolean {
        if (!rut || rut.trim().length === 0) return false;

        const cleanRut = this.clean(rut);
        if (cleanRut.length < 2) return false;

        const body = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1).toUpperCase();

        if (isNaN(parseInt(body, 10))) return false;

        // Modulo 11 check
        let suma = 0;
        let multiplicador = 2;

        for (let i = body.length - 1; i >= 0; i--) {
            suma += parseInt(body.charAt(i), 10) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }

        const resto = suma % 11;
        let dvCalculado = (11 - resto).toString();

        if (dvCalculado === '11') dvCalculado = '0';
        if (dvCalculado === '10') dvCalculado = 'K';

        return dv === dvCalculado;
    }
}
