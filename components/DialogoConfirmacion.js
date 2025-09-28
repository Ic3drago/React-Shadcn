'use client'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';


export default function DialogoConfirmacion({ open,
    onOpenChange,
    onConfirm,
    title = 'Confirmar acción',
    description = '¿Estás seguro de que deseas realizar esta acción?', confirmText = 'Confirmar',
    cancelText = 'Cancelar', isDestructive = false,
    isLoading = false }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md"> <DialogHeader>
                <div className="flex items-center gap-3"> {isDestructive && (
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>)}
                    <div>
                        <DialogTitle>{title}</DialogTitle> <DialogDescription className="mt-2">
                            {description} </DialogDescription>
                    </div> </div>
            </DialogHeader>
                <DialogFooter className="flex gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading} >
                        {cancelText} </Button> <Button
                            variant={isDestructive ? "destructive" : "default"} onClick={onConfirm}
                            disabled={isLoading}
                        >
                        {isLoading ? 'Procesando...' : confirmText}
                    </Button> </DialogFooter>
            </DialogContent> </Dialog>
    )
}