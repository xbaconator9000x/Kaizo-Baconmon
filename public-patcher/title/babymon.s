.syntax unified
.thumb
/* FireRed US Rev 1: run the native title VBlank housekeeping, then draw the static
 * indexed scene only while the original title main callback is active.
 * No save or game-state memory is reserved. The menu transition stays native.
 */
push {r4, lr}
ldr r3, original_vblank
bl call_r3
ldr r0, main_state
ldr r0, [r0, #4]
ldr r1, title_main
cmp r0, r1
bne finished
ldr r0, dma0_control
movs r1, #0
str r1, [r0]
ldr r0, scene_marker
ldr r1, [r0]
ldr r2, marker_value
cmp r1, r2
beq scene_loaded
ldr r0, gpu
movs r1, #0x80
strh r1, [r0]
/* DMA3 copies complete 240x160 mode-4 frame and 256-color palette. */
ldr r0, dma3
ldr r1, pixels
str r1, [r0]
ldr r1, vram
str r1, [r0, #4]
ldr r1, frame_dma
str r1, [r0, #8]
ldr r0, scene_marker
ldr r1, marker_value
str r1, [r0]
b finished
scene_loaded:
ldr r0, dma3
ldr r1, palette
str r1, [r0]
ldr r1, palette_ram
str r1, [r0, #4]
ldr r1, palette_dma
str r1, [r0, #8]
/* Identity affine transform, no blending or sprites; BG2 displays mode 4. */
ldr r0, dma0_control
movs r1, #0
str r1, [r0]
ldr r0, gpu
movs r1, #0
strh r1, [r0, #0x20]
strh r1, [r0, #0x22]
strh r1, [r0, #0x24]
strh r1, [r0, #0x26]
str r1, [r0, #0x28]
str r1, [r0, #0x2c]
movs r1, #1
lsls r1, r1, #8
strh r1, [r0, #0x20]
strh r1, [r0, #0x26]
movs r1, #0
adds r0, #0x50
strh r1, [r0]
strh r1, [r0, #2]
strh r1, [r0, #4]
subs r0, #0x50
ldr r1, display_mode
strh r1, [r0]
finished:
pop {r4, pc}
call_r3:
bx r3
.balign 4
original_vblank: .word 0x08078bc9
main_state: .word 0x030030f0
title_main: .word 0x08078bb1
dma3: .word 0x040000d4
pixels: .word 0x08b10600
vram: .word 0x06000000
frame_dma: .word 0x84002580
palette: .word 0x08b10400
palette_ram: .word 0x05000000
palette_dma: .word 0x84000080
gpu: .word 0x04000000
display_mode: .word 0x00000404
dma0_control: .word 0x040000b8
scene_marker: .word 0x06009ffc
marker_value: .word 0x42414259
