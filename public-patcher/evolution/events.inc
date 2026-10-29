Bacon_TradeEvolutionLady::
	lock
	faceplayer
	specialvar VAR_RESULT, Bacon_CheckTradeEvolution
	compare VAR_RESULT, 0
	goto_if_eq Bacon_TradeEvolutionNone
	msgbox Bacon_Text_TradeOffer, MSGBOX_YESNO
	compare VAR_RESULT, NO
	goto_if_eq Bacon_TradeEvolutionDone
	closemessage
	specialvar VAR_RESULT, Bacon_StartTradeEvolution
	compare VAR_RESULT, FALSE
	goto_if_eq Bacon_TradeEvolutionDone
	waitstate
Bacon_TradeEvolutionDone::
	release
	end
Bacon_TradeEvolutionNone::
	msgbox Bacon_Text_TradeNone, MSGBOX_DEFAULT
	release
	end
Bacon_LabTimeMachine::
	lockall
	msgbox Bacon_Text_SetDay, MSGBOX_YESNO
	compare VAR_RESULT, NO
	goto_if_eq Bacon_LabAskNight
	special Bacon_SetDay
	msgbox Bacon_Text_DaySet, MSGBOX_DEFAULT
	releaseall
	end
Bacon_LabAskNight::
	msgbox Bacon_Text_SetNight, MSGBOX_YESNO
	compare VAR_RESULT, NO
	goto_if_eq Bacon_LabTimeDone
	special Bacon_SetNight
	msgbox Bacon_Text_NightSet, MSGBOX_DEFAULT
Bacon_LabTimeDone::
	releaseall
	end
Bacon_Text_TradeOffer:
	.string "I can help your trade POKéMON evolve!\nWould you like me to help?$"
Bacon_Text_TradeNone:
	.string "Your lead POKéMON doesn't need my\nhelp to evolve right now.$"
Bacon_Text_SetDay:
	.string "Evolution clock: set the time to DAY?\nFriendship is still required.$"
Bacon_Text_SetNight:
	.string "Set the time to NIGHT instead?\nChoose NO to leave it unchanged.$"
Bacon_Text_DaySet:
	.string "The evolution clock is now set to DAY.$"
Bacon_Text_NightSet:
	.string "The evolution clock is now set to NIGHT.$"
