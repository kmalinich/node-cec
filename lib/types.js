let types = {
	logical_address : {
		audiosystem : 5,
		broadcast   : 15,
		freeuse     : 14,

		playbackdevice1 : 4,
		playbackdevice2 : 8,
		playbackdevice3 : 11,

		recordingdevice1 : 1,
		recordingdevice2 : 2,
		recordingdevice3 : 9,

		reserved1 : 12,
		reserved2 : 13,

		tuner1 : 3,
		tuner2 : 6,
		tuner3 : 7,
		tuner4 : 10,

		tv : 0,

		unknown      : -1,
		unregistered : 15,
	},

	opcodes : {
		abort         : 0xff,
		active_source : 0x82,
		cdc           : 0xf8,
		cec_version   : 0x9e,

		clear_analog_timer   : 0x33,
		clear_digital_timer  : 0x99,
		clear_external_timer : 0xa1,

		deck_control : 0x42,
		deck_status  : 0x1b,

		device_vendor_id : 0x87,
		end_arc          : 0xc5,
		feature_abort    : 0x00,

		get_cec_version   : 0x9f,
		get_menu_language : 0x91,

		give_audio_status             : 0x71,
		give_deck_status              : 0x1a,
		give_device_power_status      : 0x8f,
		give_device_vendor_id         : 0x8c,
		give_osd_name                 : 0x46,
		give_physical_address         : 0x83,
		give_system_audio_mode_status : 0x7d,
		give_tuner_device_status      : 0x08,

		image_view_on   : 0x04,
		inactive_source : 0x9d,

		menu_request : 0x8d,
		menu_status  : 0x8e,

		none : 0xfd,
		play : 0x41,

		record_off       : 0x0b,
		record_on        : 0x09,
		record_status    : 0x0a,
		record_tv_screen : 0x0f,

		report_arc_ended        : 0xc2,
		report_arc_started      : 0xc1,
		report_audio_status     : 0x7a,
		report_physical_address : 0x84,
		report_power_status     : 0x90,

		request_active_source : 0x85,
		request_arc_end       : 0xc4,
		request_arc_start     : 0xc3,

		routing_change      : 0x80,
		routing_information : 0x81,

		select_analog_service  : 0x92,
		select_digital_service : 0x93,

		set_analog_timer        : 0x34,
		set_audio_rate          : 0x9a,
		set_digital_timer       : 0x97,
		set_external_timer      : 0xa2,
		set_menu_language       : 0x32,
		set_osd_name            : 0x47,
		set_osd_string          : 0x64,
		set_stream_path         : 0x86,
		set_system_audio_mode   : 0x72,
		set_timer_program_title : 0x67,

		standby   : 0x36,
		start_arc : 0xc0,

		system_audio_mode_request : 0x70,
		system_audio_mode_status  : 0x7e,

		text_view_on : 0x0d,

		timer_cleared_status : 0x43,
		timer_status         : 0x35,

		tuner_device_status  : 0x07,
		tuner_step_decrement : 0x06,
		tuner_step_increment : 0x05,

		user_control_pressed : 0x44,
		user_control_release : 0x45,

		vendor_command         : 0x89,
		vendor_command_with_id : 0xa0,

		vendor_remote_button_down : 0x8a,
		vendor_remote_button_up   : 0x8b,
	},

	power_status : {
		off    : 0x01,
		off2on : 0x02,
		on     : 0x00,
		on2off : 0x03,

		unknown : 0x99,
	},

	user_control : {
		an_channels_list : 0x96,
		an_return        : 0x91,

		angle : 0x50,

		arrow_down       : 0x02,
		arrow_left       : 0x03,
		arrow_left_down  : 0x08,
		arrow_left_up    : 0x07,
		arrow_right      : 0x04,
		arrow_right_down : 0x06,
		arrow_right_up   : 0x05,
		arrow_up         : 0x01,

		backward : 0x4c,

		channel_down : 0x31,
		channel_up   : 0x30,

		contents_menu            : 0x0b,
		display_information      : 0x35,
		electronic_program_guide : 0x53,

		clear    : 0x2c,
		data     : 0x76,
		dot      : 0x2a,
		dvd_menu : 0x11,
		eject    : 0x4a,
		enter    : 0x2b,
		exit     : 0x0d,

		f1_blue   : 0x71,
		f2_red    : 0x72,
		f3_green  : 0x73,
		f4_yellow : 0x74,
		f5        : 0x75,

		fast_forward          : 0x49,
		favorite_menu         : 0x0c,
		forward               : 0x4b,
		help                  : 0x36,
		initial_configuration : 0x55,
		input_select          : 0x34,
		max                   : 0x96,

		mute          : 0x43,
		mute_function : 0x65,

		next_favorite : 0x2f,

		number0  : 0x20,
		number1  : 0x21,
		number2  : 0x22,
		number3  : 0x23,
		number4  : 0x24,
		number5  : 0x25,
		number6  : 0x26,
		number7  : 0x27,
		number8  : 0x28,
		number9  : 0x29,
		number11 : 0x1e,
		number12 : 0x1f,

		number_entry_mode : 0x1d,

		page_down : 0x38,
		page_up   : 0x37,

		pause                 : 0x46,
		pause_play_function   : 0x61,
		pause_record          : 0x4e,
		pause_record_function : 0x63,

		play          : 0x44,
		play_function : 0x60,

		power                 : 0x40,
		power_off_function    : 0x6c,
		power_on_function     : 0x6d,
		power_toggle_function : 0x6b,

		previous_channel : 0x32,

		record          : 0x47,
		record_function : 0x62,

		restore_volume_function : 0x66,
		rewind                  : 0x48,
		root_menu               : 0x09,

		select                      : 0x00,
		select_audio_input_function : 0x6a,
		select_av_input_function    : 0x69,
		select_broadcast_type       : 0x56,
		select_media_function       : 0x68,
		select_sound_presentation   : 0x57,

		setup_menu   : 0x0a,
		sound_select : 0x33,

		stop          : 0x45,
		stop_function : 0x64,
		stop_record   : 0x4d,

		sub_picture       : 0x51,
		timer_programming : 0x54,
		top_menu          : 0x10,
		tune_function     : 0x67,
		unknown           : 0xff,
		video_on_demand   : 0x52,

		volume_down : 0x42,
		volume_up   : 0x41,
	},

	vendor_id : {
		akai     : 0x0020c7,
		aoc      : 0x002467,
		benq     : 0x8065e9,
		broadcom : 0x18c086,
		daewoo   : 0x009053,
		denon    : 0x0005cd,
		google   : 0x001a11,
		grundig  : 0x00d0d5,

		harman_kardon2 : 0x001950,
		harman_kardon  : 0x9c645e,

		lg          : 0x00e091,
		loewe       : 0x000982,
		marantz     : 0x000678,
		medion      : 0x000cb8,
		onkyo       : 0x0009b0,
		panasonic   : 0x008045,
		philips     : 0x00903e,
		pioneer     : 0x00e036,
		pulse_eight : 0x001582,
		samsung     : 0x0000f0,
		sharp       : 0x08001f,
		sony        : 0x080046,

		toshiba2 : 0x000ce7,
		toshiba  : 0x000039,

		unknown : 0,
		vizio   : 0x6b746d,
		yamaha  : 0x00a0de,
	},
};

module.exports = types;
