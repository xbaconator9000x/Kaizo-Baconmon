/* GPL-3.0-or-later. FireRed US Rev 1 optional evolution runtime. */
#include "bacon_evolution_core.h"
typedef unsigned short u16;
typedef unsigned char u8;
typedef unsigned int u32;
#define GET(mon,id) ((u32(*)(void*,u32,void*))0x0803FBFD)((mon),(id),0)
#define CONFIG (*(volatile u32*)0x08B0FFF0)
#define TIERS ((const u8*)0x08B0FC00)
#define PARTY ((void*)0x02024284)
#define RESULT (*(volatile u16*)0x020370D0)
#define TIMEVAR (*(volatile u16*)(*(volatile u32*)0x03005008+0x11A0))
struct Evo { u16 method,parameter,target,padding; };
__attribute__((used)) u16 BaconBinaryResolve(void *mon, u8 mode, u16 item)
{
    struct BaconEvoState s;
    struct BaconEvoBranch branches[5];
    const struct Evo *table;
    u16 held;
    u32 i;
    s.species=GET(mon,11);
    if(!s.species || s.species>411)return 0;
    s.level=GET(mon,56);s.friendship=GET(mon,32);s.beauty=GET(mon,23);
    s.attack=GET(mon,59);s.defense=GET(mon,60);s.personality=GET(mon,0);
    s.egg=GET(mon,45);s.fainted=GET(mon,57)==0;
    held=GET(mon,12);
    s.everstone=(held==175 ? *(volatile u8*)(*(volatile u32*)0x03005008+0x311A) : ((u8(*)(u16))0x0809A939)(held))==38;
    s.mode=mode;s.item=item;s.night=TIMEVAR==1;s.tiered=CONFIG==1;
    table=(const struct Evo*)(0x082597C4+s.species*40);
    for(i=0;i<5;i++){branches[i].method=table[i].method;branches[i].parameter=table[i].parameter;branches[i].target=table[i].target;}
    return BaconEvoResolve(branches,&s,TIERS);
}
__attribute__((used)) void BaconBinaryCheckTrade(void){RESULT=BaconBinaryResolve(PARTY,1,0)!=0;}
__attribute__((used)) void BaconBinaryStartTrade(void)
{
    u16 target=BaconBinaryResolve(PARTY,1,0);
    RESULT=target!=0;
    if(!target)return;
    *(volatile u32*)0x0300537C=0x080568F5;
    ((void(*)(void*,u16,u8,u8))0x080CDDBD)(PARTY,target,0,0);
}
