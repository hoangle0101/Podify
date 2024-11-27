import OptionsModal from '@components/OptionsModal';
import { NavigationAction, NavigationProp, useNavigation } from '@react-navigation/native';
import AudioListItem from '@ui/AudioListItem';
import AudioListLoadingUI from '@ui/AudioListLoadingUI';
import EmptyRecords from '@ui/EmptyRecords';
import colors from '@utils/colors';
import Upload from '@views/Upload';
import {FC, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { GestureHandlerRootView, RefreshControl } from 'react-native-gesture-handler';
import AntDesing from 'react-native-vector-icons/AntDesign'
import { QueryClient, useMutation, useQueryClient } from 'react-query';
import {useSelector} from 'react-redux';
import { AudioData, AudioRemove } from 'src/@types/audio';
import { ProfileNavigatorStackParamList } from 'src/@types/navigation';
import { getClient } from 'src/api/client';
import {useFetchUploadsByProfile} from 'src/hooks/query';
import useAudioController from 'src/hooks/useAudioController';
import {getPlayerState} from 'src/store/player';

interface Props {}

const UploadsTab: FC<Props> = props => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioData>()
  const {onGoingAudio} = useSelector(getPlayerState);
  const {data, isLoading,isFetching} = useFetchUploadsByProfile();
  const {onAudioPress} = useAudioController();
  const {navigate} =useNavigation<NavigationProp <ProfileNavigatorStackParamList>>()
  const queryClient = useQueryClient();
  const handleOnLongPress = (audio: AudioData) => {
    setSelectedAudio(audio)
    setShowOptions(true);
  };

  const removeMutation = useMutation({
    mutationFn: async upload => removeUpload(upload),
    onMutate: (upload: string) => {
      queryClient.setQueryData<AudioRemove[]>(['uploads-by-profile'], oldData =>{
        let newData: AudioRemove[] = [];
         if(!oldData) return newData;
         for (let data of oldData) {
          if(Array.isArray(data.audio)){

          
          const filtered = data.audio.filter( item => item.id.includes(upload))
        if (filtered.length) {
          newData.push({audio: filtered});
        }
         }
        }
         return newData;
      });
    },
  })

  const removeUpload = async (upload: string) =>{
    const client = await getClient();
    await client.delete('/profile/upload?upload='+ JSON.stringify(upload))
    queryClient.invalidateQueries({queryKey:['uploads-by-profile']})
    queryClient.invalidateQueries({queryKey:['recommended']})
  }
  const handleOnRemovePress = async () =>{
    setShowOptions(false);
    console.log(selectedAudio?.id)
    if(selectedAudio)
    removeMutation.mutate(selectedAudio.id)

  };
  const handleOnEditPress = () => {
    setShowOptions(false);
   
    if(selectedAudio)
    navigate('UpdateAudio', {
      audio: selectedAudio
    });
  };
  const handleOnRefresh =()=>
    {
      queryClient.invalidateQueries({queryKey:['uploads-by-profile']});
      queryClient.invalidateQueries({queryKey:['recommended']})
    }

  if (isLoading) return <AudioListLoadingUI />;

  if (!data?.length) return <EmptyRecords title="There is no audio!" />;

  return (
    <>
    <GestureHandlerRootView style={{flex: 1}}>
    <ScrollView style={styles.container}
      refreshControl ={
        <RefreshControl
        refreshing= {isFetching}
        onRefresh={handleOnRefresh}
        tintColor={colors.CONTRAST}
        />}
        >
      
      
   
      {data?.map(item => {
        return (
          <AudioListItem
            onPress={() => onAudioPress(item, data)}
            key={item.id}
            audio={item}
            isPlaying={onGoingAudio?.id === item.id}
            onLongPress={() => handleOnLongPress((item)) }
          />
        );
      })}
    </ScrollView>
    </GestureHandlerRootView>
     
   
   
    <OptionsModal
    visible={showOptions}
    onRequestClose={() => {
      setShowOptions(false);
    }}
    options={[
      {
        title: 'Edit',
        icon: 'edit',
        onPress: handleOnEditPress,
      },
      {
        title: 'remove',
        icon: 'delete',
        onPress: handleOnRemovePress,
      }
     
    ]}
    renderItem={item => {
      return (
        <Pressable onPress={item.onPress} style={styles.optionContainer}>
          <AntDesing
            size={24}
            color={colors.PRIMARY}
            name={item.icon}
          />
          <Text style={styles.optionLabel}>{item.title}</Text>
        </Pressable>
      );
    }}
  />
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionLabel: {color: colors.PRIMARY, fontSize: 16, marginLeft: 5},
});

export default UploadsTab;
