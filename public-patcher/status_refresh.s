push {r4,lr}
 ldr r4, =0x2023bc4
 ldrb r0, [r4]
 ldr r3, =0x80342b9
 bl call_r3
 lsls r0, #24
 cmp r0, #0
 bne done
 ldrb r0, [r4]
 ldr r1, =0x3004ff0
 ldrb r0, [r1,r0]
 ldr r3, =0x8049949
 bl call_r3
 ldr r3, =0x80e8ab1
 bl call_r3
 done:
 pop {r4}
 pop {r0}
 bx r0
 call_r3:
 bx r3
 .ltorg
