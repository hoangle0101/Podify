import {FC} from 'react';
import {View, StyleSheet, Text, Pressable} from 'react-native';
import {Playlist} from 'src/@types/audio';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import colors from '@utils/colors';
import { GestureHandlerRootView, RefreshControl, ScrollView } from 'react-native-gesture-handler';
import { useFetchPlaylist } from 'src/hooks/query';
import AntDesing from 'react-native-vector-icons/AntDesign';
import {useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { getAuthState } from 'src/store/auth';

interface Props {
  playlist: Playlist;
  onPress?(): void;
  handleRemovePlaylist?(): void;
  isFetching?: boolean;
}


const PlaylistItem: FC<Props> = ({playlist,handleRemovePlaylist, onPress, isFetching=false}) => {
  const queryClient =useQueryClient();
  const {profile} = useSelector(getAuthState);
  const handleOnRefresh =  () =>{
    queryClient.invalidateQueries({queryKey:['playlist']})
  }
  const {id, itemsCount, title, visibility,owner} = playlist;
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ScrollView 
    refreshControl ={
      <RefreshControl
      refreshing= {isFetching}
      onRefresh={handleOnRefresh}
      tintColor={colors.CONTRAST} />}>
 <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.posterContainer}>
        <MaterialComIcon
          name="playlist-music"
          size={30}
          color={colors.CONTRAST}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
          {title}
        </Text>

        <View style={styles.iconContainer}>
          <FontAwesomeIcon
            name={visibility === 'public' ? 'globe' : 'lock'}
            color={colors.SECONDARY}
            size={15}
          />
          <Text style={styles.count}>
            {itemsCount} {itemsCount > 1 ? 'audios' : 'audio'}
          </Text>
         
     <Pressable onPress={handleRemovePlaylist} style={styles.remove}>
    <AntDesing name="close" color={colors.CONTRAST} />
     </Pressable>
      

        </View>
      </View>
    </Pressable>
    </ScrollView>

    </GestureHandlerRootView>
    
   
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: colors.OVERLAY,
    marginBottom: 15,
  },
 
  remove:{
    position:'absolute', 
    alignItems:'center', 
    right:3
  },

  posterContainer: {
    backgroundColor: colors.OVERLAY,
    height: 50,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: colors.CONTRAST,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 5,
  },
  count: {
    color: colors.SECONDARY,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    paddingTop: 4,
  },
});

export default PlaylistItem;
