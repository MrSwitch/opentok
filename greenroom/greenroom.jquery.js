//
// GreenRoom Jquery Plaugin for OpenTok
//
// @author Andrew Dodson
//
(function($){
    $.fn.greenroom = function(){
        $(this).each(function(){

            // Define the media element we are bind too
            var localMedia = this;

            // Add a callback triggered after localMedia.detectDevices() has been fired.
            var listeners = {
                devicesDetected : function(event){

                    var devices = [
                        { selector : 'select.mics', event : event.microphones, selected : event.selectedMicrophone.name },
                        { selector : 'select.cams', event : event.cameras, selected : event.selectedCamera.name }
                    ];

                    $.each( devices, function( i, dev ){

                        // Of the devices use the selector to determine the <SELECT> tag to filter
                        var $sel = $(dev.selector);

                        // Add new items to the List
                        $.each( dev.event, function(i,item){
                            var $opt = $sel.find('option[value="'+item.name+'"]');
                            if( $opt.length === 0 ){
                                $opt = $('<option>'+item.name+'</option>').val(item.name).appendTo($sel);
                            }
                            if(item.status==='active'){
                                $opt.attr('selected','selected');
                            }
                        });

                        // Remove existing items in the list.
                        $sel.find('option').filter(function(){
                            var opt = this, b = false;
                            $.each( dev.event, function(i,o){
                                if( o.name === $(opt).text() ){
                                    b = true;
                                    return;
                                }
                            });
                            return !b;
                        }).remove();

                        // Selected
                        $sel.find('option[value="'+ dev.selected +'"]').attr('selected', 'selected');
                    });
                },

                microphoneActivityLevel : function(e){
                    if(volume){
                        volume.style.width = e.value+'%';
                    }
                },
                microphoneGainChanged : function(e){
                    $('#gain').val(e.value);
                }
            };

            var s = '<div id="greenroom">'
                +'<h1>GreenRoom</h1>'
                +'<br />'
                +'<label>Chat into Mic</label>'
                +'<select name="mics" class="mics"></select>'
                +'<div class="volume">'
                    +'<input type="range" class="gain" min=0 max=100 />'
                    +'<div></div>'
                +'</div>'
                +'<br>'
                +'<br />'
                +'<label><span class="smile">:)</span> into Cam</label>'
                +'<select name="cams" class="cams"></select>'
                +'<img class="mugshot" style="width:100px;"/>'
                +'<a class=\'refreshDevices\' href="javascript:void(0);">refresh device lists</a>'
            +'</div>';

            // CREATE LISTENERS
            for(var x in listeners) if(listeners.hasOwnProperty(x)){
                localMedia.addEventListener(x,listeners[x]);
            }

            // Create the greenroom
            var $gr = $(s).alert(function(){

                // Tear down the greenroom

                // stop capturing audio
                localMedia.detectMicActivity( false );

                // DESTROY LISTENERS
                for(var x in listeners) if(listeners.hasOwnProperty(x)){
                    localMedia.removeEventListener(x,listeners[x]);
                }

                // clear int
                clearInterval(timer);
            });

            // define volume control
            var volume = $gr.find('.volume div').get(0);

            var img = $gr.find('img').get(0);
            var timer = setInterval(function(){
                img.setAttribute('src','data:image/png;base64,'+localMedia.getImgData());
            },100);

            // Start Mic Activity
            localMedia.detectMicActivity( true );

            // Bind events to change the camera
            $gr.find('select.mics').change(function(){
                localMedia.setMicrophone(this.value);
            });

            // Bind events to change the camera
            $gr.find('select.cams').change(function(){
                localMedia.setCamera(this.value);
            });

            $gr.find('.refreshDevices').click(function(){
                localMedia.detectDevices();
            });

            $gr.find('.gain').change(function(){
                localMedia.setMicrophoneGain(this.value);
            });



            localMedia.detectDevices();

        });
    };
})(jQuery);