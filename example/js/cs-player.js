// cs-player v.1
// Carboni Corporation 2017- All right reserved https://www.carboni.ch
// Author: Carboni Davide
// @copyright Copyright (c) 2017, Carboni Software, Inc.
// @license AGPL-3.0
//
// This code is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License, version 3,
// as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License, version 3,
// along with this program.  If not, see <http://www.gnu.org/licenses/>

// Fan speed software control for Raspberry Pi 3


var player = {

audio: null,
timer: null,
current: null,
isPlay: false,

style: '\
	<style>\
	#player {\
		width: 100px;\
		height: 100px;\
		position: absolute;\
		right: 20px;\
		bottom: 20px;\
		font-size: 250%;\
		margin: 0px;\
		padding: 0px;\
	}\
	\
	#player .player-button,\
	#player .player-item{\
		color: #424242;\
		display: flex;\
		align-items: center;\
	justify-content: center;\
	border-radius: 50%;\
	background-size: 100%;\
	overflow: hidden;\
	cursor: pointer;\
	box-shadow: 0 0 10px black;\
	background: white;\
	transition: box-shadow 300ms ease-in-out;\
	}\
	\
	#player .player-button {\
		width: 100px;\
	height: 100px;\
		position: absolute;\
		right: 0px;\
		bottom: 0px;\
		opacity: 0;\
	z-index: -1;\
	}\
	\
	#player .player-item {\
		width: 70px;\
	height: 70px;\
		position: absolute;\
		left: 15px;\
	top: 15px;\
	transition: 0.3s;\
	}\
	\
	#player .player-button:hover,\
	#player .player-item:hover{\
		box-shadow: 0 0 20px black;\
	}\
	\
	#player .player-button svg{\
		transition: transform 300ms ease-in-out;\
		transform: scale(0);\
	}\
	\
	#player .boxer-closed > div:first-of-type,\
	#player .boxer-opened > div:last-of-type{\
		opacity: 1;\
		z-index: 1;\
	}\
	\
	#player .boxer-closed > div:first-of-type svg,\
	#player .boxer-opened > div:last-of-type svg{\
		transform: scale(1);\
		transition: transform 300ms ease-in-out;\
	}\
	\
	#player #play svg,\
	#player #pause svg{\
		transition: transform 300ms ease-in-out;\
		transform: scale(0);\
	}\
	\
	#player .isPause #play,\
	#player .isPlay #pause{\
		z-index: 1;\
	}\
	\
	#player .isPause #play svg,\
	#player .isPlay #pause svg{\
		transform: scale(1);\
		transition: transform 300ms ease-in-out;\
	}\
	\
	#player .expand #next {\
		transform: rotate(0deg) translateY(-105px) rotate(0deg);\
	}\
	\
	#player .expand #play,\
	#player .expand #pause{\
		transform: rotate(-45deg) translateY(-105px) rotate(45deg);\
	}\
	\
	#player .expand #prev {\
		transform: rotate(-90deg) translateY(-105px) rotate(90deg);\
	}\
	\
	@media only screen and (max-width: 780px) {\
		\
		#player {\
			width: 75px;\
			height: 75px;\
			font-size: 150%;\
		}\
		\
		#player .player-button {\
			width: 75px;\
			height: 75px;\
		}\
		\
		#player .player-item {\
			width: 50px;\
			height: 50px;\
		}\
		\
		#player .expand #next {\
			transform: rotate(0deg) translateY(-75px) rotate(0deg);\
		}\
		\
		#player .expand #play,\
		#player .expand #pause{\
			transform: rotate(-45deg) translateY(-75px) rotate(45deg);\
		}\
		\
		#player .expand #prev {\
			transform: rotate(-90deg) translateY(-75px) rotate(90deg);\
		}\
		\
	}\
	</style>',

content: '\
	<div id="boxer-items" class="isPause">\
	\
		<div id="pause" class="player-item"  title="Stop Music">\
			<svg class="bi bi-pause-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\
			<path d="M5.5 3.5A1.5 1.5 0 017 5v6a1.5 1.5 0 01-3 0V5a1.5 1.5 0 011.5-1.5zm5 0A1.5 1.5 0 0112 5v6a1.5 1.5 0 01-3 0V5a1.5 1.5 0 011.5-1.5z"/>\
			</svg>\
		</div>\
	\
		<div id="play" class="player-item"  title="Play Music">\
			<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\
			<path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z"/>\
			</svg>\
		</div>\
	\
		<div id="prev" class="player-item"  title="Play Back">\
			<svg class="bi bi-skip-start-fill" width="3em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\
			<path fill-rule="evenodd" d="M4.5 3.5A.5.5 0 004 4v8a.5.5 0 001 0V4a.5.5 0 00-.5-.5z" clip-rule="evenodd"/>\
			<path d="M4.903 8.697l6.364 3.692c.54.313 1.232-.066 1.232-.697V4.308c0-.63-.692-1.01-1.232-.696L4.903 7.304a.802.802 0 000 1.393z"/>\
			</svg>\
		</div>\
	\
		<div id="next" class="player-item"  title="Play Next">\
			<svg class="bi bi-skip-end-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\
			<path fill-rule="evenodd" d="M12 3.5a.5.5 0 01.5.5v8a.5.5 0 01-1 0V4a.5.5 0 01.5-.5z" clip-rule="evenodd"/>\
			<path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z"/>\
			</svg>\
		</div>\
	</div>\
	\
	<div id="boxer-buttons" class="boxer-closed">\
	\
		<div id="open-player" class="player-button">\
			<svg class="bi bi-music-note-list" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\
			<path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z"/>\
			<path fill-rule="evenodd" d="M12 3v10h-1V3h1z" clip-rule="evenodd"/>\
			<path d="M11 2.82a1 1 0 01.804-.98l3-.6A1 1 0 0116 2.22V4l-5 1V2.82z"/>\
			<path fill-rule="evenodd" d="M0 11.5a.5.5 0 01.5-.5H4a.5.5 0 010 1H.5a.5.5 0 01-.5-.5zm0-4A.5.5 0 01.5 7H8a.5.5 0 010 1H.5a.5.5 0 01-.5-.5zm0-4A.5.5 0 01.5 3H8a.5.5 0 010 1H.5a.5.5 0 01-.5-.5z" clip-rule="evenodd"/>\
			</svg>\
		</div>\
	\
		<div id="close-player" class="player-button">\
			<svg class="bi bi-box-arrow-in-down-right" width="1.5em" height="1.5em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\
			<path fill-rule="evenodd" d="M14.5 13a1.5 1.5 0 01-1.5 1.5H3A1.5 1.5 0 011.5 13V8a.5.5 0 011 0v5a.5.5 0 00.5.5h10a.5.5 0 00.5-.5V3a.5.5 0 00-.5-.5H9a.5.5 0 010-1h4A1.5 1.5 0 0114.5 3v10z" clip-rule="evenodd"/>\
			<path fill-rule="evenodd" d="M4.5 10a.5.5 0 00.5.5h5a.5.5 0 00.5-.5V5a.5.5 0 00-1 0v4.5H5a.5.5 0 00-.5.5z" clip-rule="evenodd"/>\
			<path fill-rule="evenodd" d="M10.354 10.354a.5.5 0 000-.708l-8-8a.5.5 0 10-.708.708l8 8a.5.5 0 00.708 0z" clip-rule="evenodd"/>\
			</svg>\
		</div>\
	</div>',

	playlist: [],

	load: function(playlist){
		player.playlist = playlist;
		player.define_content();
		player.define_style();
		player.define_playlist();
		player.define_events();
		player.current = $("#playlist li:first-child");
		this.init_audio();
	},
	expand: function(){
		$('#player #boxer-buttons').removeClass("boxer-closed").addClass("boxer-opened");
		$('#player #boxer-items').addClass("expand");
	},
	compress: function(){
		$('#player #boxer-buttons').removeClass("boxer-opened").addClass("boxer-closed");
		$('#player #boxer-items').removeClass("expand");
	},
	visibility: function(){
		$('#player #boxer-buttons').hasClass("boxer-closed") ? player.expand() : player.compress();
	},
	start: function(){
		player.init_audio();
		player.audio.play();
		player.isPlay = true;
		$('#player #boxer-items').addClass("isPlay").removeClass("isPause");
	},
	pause: function(){
		player.isPlay = false;	
		player.audio.pause();
		$('#player #boxer-items').removeClass("isPlay").addClass("isPause");
	},
	next: function(){
		player.audio.pause();
		player.current = $('#playlist li.active').next();
		
		if (player.current.length == 0) {
			player.current = $('#playlist li:first-child');
			player.pause();
			player.init_audio();
			return;
		}
		
		player.start();
	},
	back: function(){
		player.audio.pause();
    	player.current = $('#playlist li.active').prev();

		if (player.current.length == 0) {
       	 player.current = $('#playlist li:last-child');
    	}

		player.start();
	},
	init_audio: function(){
		var song = player.current.attr('song');
		//Create a New Audio Object
		player.audio = new Audio(song);	
		$("#playlist li").removeClass('active');
		player.current.addClass("active");
		clearInterval(player.timer);
		player.timer = setInterval(player.auto_next, 1000);
	},
	auto_next: function(){
		if( (player.audio.duration == player.audio.currentTime) && (player.isPlay) ){
			player.next();
		}
	},
	define_events: function(){
		$('#player').on("click", "#play",  player.start);
		$('#player').on("click", "#pause", player.pause);
		$('#player').on("click", "#next",  player.next);
		$('#player').on("click", "#prev",  player.back);
		$('#player').on("click", "#boxer-buttons",  player.visibility);
	},
	define_content: function(){
		$('#player').append(player.content);
	},
	define_style: function(){
		$('#player').append(player.style);
	},
	define_playlist: function(){
		$('#player').append('<ul id="playlist" style="display:none">');
		player.playlist.forEach(function(item){
			$('#playlist').append('<li song="' + item + '" type="audio/ogg"></li>');
		});
		$('#player').append('</ul>');
	}
}