import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
    providedIn: "root"
})
export class AuthStore {

    private readonly router: Router = inject(Router);

    guardarToken(token: string): void {
        sessionStorage.setItem("accessToken", token);
    }

    obtenerToken(): string | null {
        return sessionStorage.getItem("accessToken");
    }

    obtenerNombreUsuario(): string | null {
        const token = this.obtenerToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.nombre ?? payload.sub ?? null;
        } catch {
            return null;
        }
    }

    cerrarSesion(): void {
        sessionStorage.removeItem("accessToken");
        this.router.navigateByUrl("/login");
    }

}