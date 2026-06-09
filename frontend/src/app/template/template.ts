import { Component, inject } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthStore } from "../auth/auth-store";

@Component({
    selector: 'app-template',
    templateUrl: './template.html',
    styleUrl: './template.css',
    imports: [ButtonModule, RouterLink, RouterLinkActive]
})
export class Template {

    private readonly authStore: AuthStore = inject(AuthStore);

    readonly nombreUsuario = this.authStore.obtenerNombreUsuario();
    readonly fechaHoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    cerrarSesion() {
        this.authStore.cerrarSesion();
    }

}
