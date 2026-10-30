/* GPL-3.0-or-later. US FireRed Rev 1 Babymon attempt guard. */
typedef unsigned char u8;
typedef unsigned short u16;
typedef unsigned int u32;
#define BYTE(a) (*(volatile u8*)(a))
#define HALF(a) (*(volatile u16*)(a))
#define WORD(a) (*(volatile u32*)(a))
#define PARTY 0x02024284
#define COUNT BYTE(0x02024029)
#define MAIN 0x030030F0
#define CONFIG WORD(0x08B0FFF0)
#define MAGIC 0xBA31
#define GET(id) ((u32(*)(void*,u32,void*))0x0803FBFD)((void*)PARTY,id,0)
#include "font.h"
/* 0x40D1-D6: version magic, terminal/active state, PID, OT ID. D0 is clock. */
static volatile u16* metadata(void){return (volatile u16*)(WORD(0x03005008)+0x11A2);}
static int validSave(void){u32 p=WORD(0x03005008);return p>=0x02000000 && p<0x0203B000;}
static int check(void){
 volatile u16* m;u32 pid,ot;
 if(CONFIG!=1 || !validSave())return 0;
 /* Loading a save for the title menu must still permit NEW GAME. */
 if(WORD(MAIN)!=0x08056549 && !(BYTE(MAIN+0x439)&1))return 0;
 m=metadata();
 if(m[0]!=MAGIC){
  if(!COUNT)return 0;
  /* New attempts bind only the lab's first single starter; no mid-run adoption. */
  if(COUNT!=1 || BYTE(WORD(0x03005008)+4)!=4 || BYTE(WORD(0x03005008)+5)!=3){m[0]=MAGIC;m[1]=3;return 3;}
  if(!GET(11)||GET(45))return 0;
  pid=GET(0);ot=GET(1);m[2]=pid;m[3]=pid>>16;m[4]=ot;m[5]=ot>>16;m[1]=1;m[0]=MAGIC;
 }
 if(m[1]!=1)return m[1];
 if(COUNT!=1 || GET(0)!=((u32)m[2]|((u32)m[3]<<16)) || GET(1)!=((u32)m[4]|((u32)m[5]<<16)) || !GET(11) || GET(45))m[1]=3;
 else if(GET(57)==0)m[1]=2;
 return m[1]==1 ? 0 : m[1];
}
static void text(int x,int y,const char* s,u16 color){
 int row,col,k;
 for(;*s;s++,x+=6)for(row=0;row<9;row++)for(col=0;col<5;col++){
  k=(unsigned char)*s;
  if(k>=32&&k<127&&(font[k-32][row]&(1<<col)))HALF(0x06000000+2*((y+row)*240+x+col))=color;
 }
}
static void failure(int reason){
 int i;volatile u16* m=metadata();
 /* Save the terminal state once, before installing the result screen. No revival on Continue. */
 if(m[1]<0x100){m[1]|=0x100;((u8(*)(u8))0x080DA379)(0);}
 WORD(MAIN+0xC)=0;WORD(MAIN+0x10)=0;
 if(HALF(0x04000000)!=0x0403){
 HALF(0x04000020)=0x100;HALF(0x04000022)=0;HALF(0x04000024)=0;HALF(0x04000026)=0x100;WORD(0x04000028)=0;WORD(0x0400002C)=0;
 for(i=0;i<240*160;i++)HALF(0x06000000+i*2)=0x1042;
 text(57,23,"ATTEMPT OVER",0x7FFF);
 text(reason==2?57:33,51,reason==2?"RUNNER FAINTED":"RUNNER RULE BROKEN",0x1AFF);
 text(21,82,"ONLY YOUR STARTER MAY JOIN",0x7FFF);
 text(30,96,"EVOLVING IT IS PERMITTED",0x7FFF);
 text(39,130,"START: RETURN TO TITLE",0x7FFF);
 HALF(0x04000000)=0x0403;
 }
 if(HALF(MAIN+0x2E)&8){BYTE(0x03007FFA)=0;__asm__ volatile("swi 0");}
}
__attribute__((used)) void BaconChallengeCallbacks(void){
 int reason;
 /* Preserve the original callback dispatch and help/save-error gates. */
 if(((int(*)(void))0x080F5191)() || ((u8(*)(void))0x0813B8E9)())return;
 reason=check();if(reason){failure(reason&255);return;}
 if(WORD(MAIN))((void(*)(void))WORD(MAIN))();
 reason=check();if(reason){failure(reason&255);return;}
 if(WORD(MAIN+4))((void(*)(void))WORD(MAIN+4))();
 reason=check();if(reason)failure(reason&255);
}
