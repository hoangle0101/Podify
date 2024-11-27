import AppView from '@components/AppView';
import LatestUploads from '@components/LatestUploads';
import OptionsModal from '@components/OptionsModal';
import PlaylistForm, {PlaylistInfo} from '@components/PlaylistForm';
import PlayListModal from '@components/PlaylistModal';
import RecentlyPlayed from '@components/RecentlyPlayed';
import RecommendedAudios from '@components/RecommendedAudios';
import RecommendedPlaylist from '@components/RecommendedPlaylist';
import { useNavigation } from '@react-navigation/native';
import AudioListItem from '@ui/AudioListItem';
import AudioListModal from '@ui/AudioListModal';
import colors from '@utils/colors';
import { Form } from 'formik';
import {FC, useEffect, useState} from 'react';
import {StyleSheet, Pressable, Text, ScrollView, View, TouchableOpacity, ActivityIndicator} from 'react-native';
import { FlatList, GestureHandlerRootView, RefreshControl, TextInput } from 'react-native-gesture-handler';
import { blue } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQueryClient } from 'react-query';
import {useDispatch, useSelector} from 'react-redux';
import {AudioData, Playlist} from 'src/@types/audio';
import catchAsyncError from 'src/api/catchError';
import {getClient} from 'src/api/client';
import {useFetchPlaylist, useFetchRecentlyPlayed} from 'src/hooks/query';
import useAudioController from 'src/hooks/useAudioController';
import HomeNavigator from 'src/navigation/HomeNavigator';
import {upldateNotification} from 'src/store/notification';
import { getPlayerState } from 'src/store/player';
import AntDesing from 'react-native-vector-icons/AntDesign';
import {
  updatePlaylistVisbility,
  updateSelectedListId,
} from 'src/store/playlistModal';

interface Props {}

const Home: FC<Props> = props => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioData>();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  const [isLoading, setIsLoading]= useState(false);
  const [error, setError]= useState<Error | null>(null);
  const [fullData, setFullData]= useState<AudioData[]>([]);
  const {onGoingAudio} = useSelector(getPlayerState);
  const [visible, setVisible] =useState(false);
  const queryClient = useQueryClient();

  const [value, setValue] =useState("");
  const {onAudioPress} = useAudioController();

  const {data, isFetching} = useFetchPlaylist();
  // const navigate =useNavigation(HomeNavigator);

  const dispatch = useDispatch();

  const handleOnFavPress = async () => {
    if (!selectedAudio) return;
    // send request with the audio id that we want to add to fav

    try {
      const client = await getClient();
      

      const {data} = await client.post('/favorite?audioId=' + selectedAudio.id);
    } catch (error) {
      const errorMessage = catchAsyncError(error);
      dispatch(upldateNotification({message: errorMessage, type: 'error'}));
    }

    setSelectedAudio(undefined);
    setShowOptions(false);
  };

  
 
  if(isLoading) 
    return (
  <View style ={{flex:1, justifyContent:'center', alignItems:'center'}}>
    <ActivityIndicator size={"large"} color={"green"}/>

  </View>
    ) 


  const handleOnLongPress = (audio: AudioData) => {
    setSelectedAudio(audio);
    setShowOptions(true);
  };

  const handleOnAddToPlaylist = () => {
    setShowOptions(false);
    setShowPlaylistModal(true);
  };

  const handlePlaylistSubmit = async (value: PlaylistInfo) => {
    if (!value.title.trim()) return;

    try {
      const client = await getClient();
      const {data} = await client.post('/playlist/create', {
        resId: selectedAudio?.id,
        title: value.title,
        visibility: value.private ? 'private' : 'public',
      });
      console.log(data);
    } catch (error) {
      const errorMessage = catchAsyncError(error);
      console.log(errorMessage);
    }
  };

  const updatePlaylist = async (item: Playlist) => {
    try {
      const client = await getClient();
      const {data} = await client.patch('/playlist', {
        id: item.id,
        item: selectedAudio?.id,
        title: item.title,
        visibility: item.visibility,
      });

      setSelectedAudio(undefined);
      setShowPlaylistModal(false);
      dispatch(
        upldateNotification({message: 'New audio added.', type: 'success'}),
      );
    } catch (error) {
      const errorMessage = catchAsyncError(error);
      console.log(errorMessage);
    }
  };

  const handleOnRefresh =()=>
    {
      queryClient.invalidateQueries({queryKey:['latest-uploads']});
      queryClient.invalidateQueries({queryKey:['recently-played']});
      queryClient.invalidateQueries({queryKey:['recommended-playlist']});
      queryClient.invalidateQueries({queryKey:['playlist']});
    }


  const handleOnListPress = (playlist: Playlist) => {
    dispatch(updateSelectedListId(playlist.id));
    dispatch(updatePlaylistVisbility(true));
  };

  

  const handleClear = () =>{
    setValue("");
  };

   const handleSearch = async (title: any) =>{
    setValue(title);
    try {
      
      const client = await getClient();
      const {data} = await client.get(`/audio/search?title=${title}`);
      const results = data.results;
     console.log(results)
      if(results){
        setFullData(results);
      }
    

    } catch (error) {
      
    }
   

   }

  
  return (
    <GestureHandlerRootView style= {{flex:1}}>
    
<AppView>

<ScrollView contentContainerStyle={styles.container}>
<SafeAreaView style={{ marginHorizontal:20, justifyContent:'center', flexDirection:'row', position:'relative' }}>

  <TextInput 
  placeholder='Search' 
  placeholderTextColor= "gray" 
  autoCapitalize='none'
  value={value}

  onChangeText={(title)=> handleSearch(title)}
  autoCorrect={false}
   style={styles.input}>
  </TextInput>

 {value.length>0 ? <Pressable onPress={handleClear}  style={({ pressed }) => [
            styles.remove,
            {
              opacity: pressed ? 0.5 : 1,
            },
          ]}>
    <AntDesing name="close" color={colors.CONTRAST} />
     </Pressable>:null}

  


 
</SafeAreaView>
</ScrollView>



{
   (fullData.length && value.length>0)?
    <FlatList
    
    data={fullData}
    keyExtractor={item => item.id}
    renderItem={({item}) => {
      return (
        <AudioListItem 
          onPress={() => onAudioPress(item, fullData)}
        
          audio={item}
          isPlaying={onGoingAudio?.id === item.id}
        />
      );
    }}
  />
   
:<ScrollView contentContainerStyle={styles.container}
refreshControl = {
  <RefreshControl
   refreshing ={isFetching}
   onRefresh={handleOnRefresh}
   tintColor={colors.CONTRAST}
  />
 }>
 
  <View>
<View style={styles.space}>
    <RecentlyPlayed />
  </View>

  <View style={styles.space}>
    <LatestUploads
      onAudioPress={onAudioPress}
      onAudioLongPress={handleOnLongPress}
    />
  </View>
  <View style={styles.space}>
    <RecommendedAudios
      onAudioPress={onAudioPress}
      onAudioLongPress={handleOnLongPress}
    />
  </View>

  <View style={styles.space}>
    <RecommendedPlaylist onListPress={handleOnListPress} />
  </View>

  <OptionsModal
    visible={showOptions}
    onRequestClose={() => {
      setShowOptions(false);
    }}
    options={[
      {
        title: 'Add to playlist',
        icon: 'playlist-music',
        onPress: handleOnAddToPlaylist,
      },
      {
        title: 'Add to favorite',
        icon: 'cards-heart',
        onPress: handleOnFavPress,
      },
    ]}
    renderItem={item => {
      return (
        <Pressable onPress={item.onPress} style={styles.optionContainer}>
          <MaterialComIcon
            size={24}
            color={colors.PRIMARY}
            name={item.icon}
          />
          <Text style={styles.optionLabel}>{item.title}</Text>
        </Pressable>
      );
    }}
  />
  <PlayListModal
    visible={showPlaylistModal}
    onRequestClose={() => {
      setShowPlaylistModal(false);
    }}
    list={data || []}
    onCreateNewPress={() => {
      setShowPlaylistModal(false);
      setShowPlaylistForm(true);
    }}
    onPlaylistPress={updatePlaylist}
  />

  <PlaylistForm
    visible={showPlaylistForm}
    onRequestClose={() => {
      setShowPlaylistForm(false);
    }}
    onSubmit={handlePlaylistSubmit}
  />

</View>
</ScrollView>
  }
 

 
  

</AppView>
    </GestureHandlerRootView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  space: {
    marginBottom: 15,
    marginTop: 10,
  },

  remove:{
    position:'absolute', 
    alignItems:'center', 
    right:8,
    top:26
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  input:{
    paddingHorizontal:20,
     paddingVertical: 8, 
     borderColor: colors.CONTRAST,
     borderWidth: 0.8,
     borderRadius: 8,
     flexDirection: 'row', width: '100%',
     flex:1,
     marginTop: 10,
     
     color: colors.CONTRAST
     },
  optionLabel: {color: colors.PRIMARY, fontSize: 16, marginLeft: 5},
});

export default Home;
