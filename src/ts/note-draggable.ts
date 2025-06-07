// note-draggable.ts

/**
 * Interface for drag event callbacks
 */
interface IDragCallbacks {
    onDragStart?: (element: HTMLElement) => void;
    onDragMove?: (element: HTMLElement, x: number, y: number) => void;
    onDragEnd?: (element: HTMLElement) => void;
    onLongPress?: (element: HTMLElement) => void;
}

/**
 * Handles drag and drop functionality for elements
 * Supports both mouse and touch events
 */
class NoteDraggable {
    private element: HTMLElement;
    private callbacks: IDragCallbacks;
    
    private startX: number = 0;
    private startY: number = 0;
    private isDragging: boolean = false;
    
    private mouseMoveHandler?: (e: MouseEvent) => boolean;
    private mouseUpHandler?: (e: MouseEvent) => boolean;
    private touchMoveHandler?: (e: TouchEvent) => boolean;
    private touchEndHandler?: (e: TouchEvent) => boolean;
    
    private longPressTimer?: number;
    private readonly LONG_PRESS_DURATION = 500;
    
    /**
     * Create a new draggable handler
     */
    constructor(element: HTMLElement, callbacks: IDragCallbacks = {}) {
        this.element = element;
        this.callbacks = callbacks;
        this.setupEventListeners();
    }
    
    /**
     * Set up initial event listeners on the element
     */
    private setupEventListeners(): void {
        this.element.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        
        if (supportsTouch) {
            this.element.addEventListener('touchstart', (e) => this.onTouchStart(e), false);
            this.element.addEventListener('touchend', (e) => this.onTouchEnd(e), false);
            this.element.addEventListener('touchcancel', (e) => this.onTouchEnd(e), false);
        }
    }
    
    /**
     * Handle mouse down event
     */
    private onMouseDown(e: MouseEvent): boolean {
        this.startDrag(e.clientX, e.clientY);
        
        // Memoize event handlers
        if (!this.mouseMoveHandler) {
            this.mouseMoveHandler = this.onMouseMove.bind(this);
            this.mouseUpHandler = this.onMouseUp.bind(this);
        }
        
        document.addEventListener('mousemove', this.mouseMoveHandler!, true);
        document.addEventListener('mouseup', this.mouseUpHandler!, true);
        return false;
    }
    
    /**
     * Handle mouse move event
     */
    private onMouseMove(e: MouseEvent): boolean {
        if (!this.isDragging) {
            return true;
        }
        
        this.updatePosition(e.clientX, e.clientY);
        return false;
    }
    
    /**
     * Handle mouse up event
     */
    private onMouseUp(e: MouseEvent): boolean {
        if (this.mouseMoveHandler) {
            document.removeEventListener('mousemove', this.mouseMoveHandler, true);
        }
        
        if (this.mouseUpHandler) {
            document.removeEventListener('mouseup', this.mouseUpHandler, true);
        }
        
        this.endDrag();
        return false;
    }
    
    /**
     * Handle touch start event
     */
    private onTouchStart(e: TouchEvent): boolean {
        e.preventDefault();
        if (e.targetTouches.length !== 1) {
            return false;
        }
        
        const touch = e.targetTouches[0];
        this.startDrag(touch.clientX, touch.clientY);
        
        if (!this.touchMoveHandler || !this.touchEndHandler) {
            this.touchMoveHandler = this.onTouchMove.bind(this);
            this.touchEndHandler = this.onTouchEnd.bind(this);
        }
        
        document.addEventListener('touchmove', this.touchMoveHandler, true);
        document.addEventListener('touchend', this.touchEndHandler, true);
        document.addEventListener('touchcancel', this.touchEndHandler, true);
        
        // Start long press timer for touch devices
        this.longPressTimer = window.setTimeout(() => {
            this.onLongPress();
        }, this.LONG_PRESS_DURATION);
        
        return false;
    }
    
    /**
     * Handle touch move event
     */
    private onTouchMove(e: TouchEvent): boolean {
        if (!this.isDragging || e.targetTouches.length !== 1) {
            return true;
        }
        
        // Cancel long press timer when user starts dragging
        this.cancelLongPressTimer();
        
        const touch = e.targetTouches[0];
        this.updatePosition(touch.clientX, touch.clientY);
        return false;
    }
    
    /**
     * Handle touch end event
     */
    private onTouchEnd(e: TouchEvent): boolean {
        // Cancel long press timer
        this.cancelLongPressTimer();
        
        if (this.touchMoveHandler) {
            document.removeEventListener('touchmove', this.touchMoveHandler, true);
        }
        
        if (this.touchEndHandler) {
            document.removeEventListener('touchend', this.touchEndHandler, true);
            document.removeEventListener('touchcancel', this.touchEndHandler, true);
        }
        
        this.endDrag();
        return false;
    }
    
    /**
     * Start dragging operation
     */
    private startDrag(clientX: number, clientY: number): void {
        this.isDragging = true;
        this.startX = clientX - this.element.offsetLeft;
        this.startY = clientY - this.element.offsetTop;
        
        if (this.callbacks.onDragStart) {
            this.callbacks.onDragStart(this.element);
        }
    }
    
    /**
     * Update element position during drag
     */
    private updatePosition(clientX: number, clientY: number): void {
        const newX = clientX - this.startX;
        const newY = clientY - this.startY;
        
        this.element.style.left = `${newX}px`;
        this.element.style.top = `${newY}px`;
        
        if (this.callbacks.onDragMove) {
            this.callbacks.onDragMove(this.element, newX, newY);
        }
    }
    
    /**
     * End dragging operation
     */
    private endDrag(): void {
        this.isDragging = false;
        
        if (this.callbacks.onDragEnd) {
            this.callbacks.onDragEnd(this.element);
        }
    }
    
    /**
     * Handle long press event (touch only)
     */
    private onLongPress(): void {
        this.longPressTimer = undefined;
        // Trigger long press callback if provided
        if (this.callbacks.onLongPress) {
            this.callbacks.onLongPress(this.element);
        }
    }
    
    /**
     * Cancel the long press timer
     */
    private cancelLongPressTimer(): void {
        if (this.longPressTimer !== undefined) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = undefined;
        }
    }
    
    /**
     * Clean up event listeners
     */
    public destroy(): void {
        // Remove document-level listeners if they exist
        if (this.mouseMoveHandler) {
            document.removeEventListener('mousemove', this.mouseMoveHandler, true);
        }
        if (this.mouseUpHandler) {
            document.removeEventListener('mouseup', this.mouseUpHandler, true);
        }
        if (this.touchMoveHandler) {
            document.removeEventListener('touchmove', this.touchMoveHandler, true);
        }
        if (this.touchEndHandler) {
            document.removeEventListener('touchend', this.touchEndHandler, true);
            document.removeEventListener('touchcancel', this.touchEndHandler, true);
        }
        
        this.cancelLongPressTimer();
    }
}