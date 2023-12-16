import { useNavigate, useParams } from "react-router-dom";
import * as Style from "../components/MyScheduleDetail/style";
import dayjs, { Dayjs } from "dayjs";
import useConfirmModal from "../hooks/useConfirmModal";
import { PeriodTag } from "../components/_common/Tag/PeriodTab";
import Header from "../components/_common/Header";
import ScheduleCard from "../components/_common/ScheduleCard";
import { Icon } from "../assets";
import useSurvey from "../hooks/useSurvey";
import useSchedule2 from "../hooks/useSchedule2";
import { useState } from "react";
import BottomSheet from "../components/_common/BottomSheet";
import { DndProvider } from "react-dnd-multi-backend";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { NewSceduleInfo, ScheduleById } from "../api/clova";

export type Schedule = {
  id: number;
  realday: string;
  email: string;
  time: number;
  content: string;
  description: string;
  isEditable: boolean;
};

export type ScheduleByDate = { [key: string]: Omit<Schedule, "realday">[] };

const MyDetailSchedule = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [openShare, setOpenShare] = useState(false);

  const [mode, setMode] = useState<"EDIT" | "VIEW">("VIEW");

  const {
    day,
    schedule,
    date,
    onChangeDescription,
    setDay,
    onDragStart,
    onDragEnd,
    onAvailableItemDragEnter,
    onDragOver,
    onDeleteSchedule,
    addItem,
    onChangeContent,
    setSchedule,
    setDate,
  } = useSchedule2();

  const getDate = (schedule: NewSceduleInfo) => {
    const result = Object.keys(schedule);
    result.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return { startDate: dayjs(result[0]), endDate: dayjs(result.at(-1)) };
  };

  const { startDate, endDate } = getDate(schedule);

  const getTripPeriod = () => {
    const tripPeriod = dayjs(endDate.format("YYYY-MM-DD")).diff(
      startDate.format("YYYY-MM-DD"),
      "day"
    );

    return tripPeriod;
  };

  const period = `${getTripPeriod()}박 ${getTripPeriod() + 1}일`;

  const dateFormatting = (date: Dayjs) => {
    return `${date.format("YYYY.MM.DD")}`;
  };

  const totalDay = getTripPeriod() + 1;

  const { openConfirmModal, closeConfirmModal } = useConfirmModal();

  const onSaveSchedule = () => {
    openConfirmModal({
      type: "COMPLETE",
      confirm: () => {
        navigate("/my-schedule");
      },
      cancel: closeConfirmModal,
    });
  };

  const openDeleteModal = () => {
    openConfirmModal({
      type: "DELETE",
      confirm: () => {
        navigate("/mySchedule");
      },
      cancel: closeConfirmModal,
    });
  };

  const back = () => {
    if (mode === "EDIT") {
      openConfirmModal({
        type: "EIXT_WHEN_EDITING",
        confirm: () => {
          navigate("/mySchedule");
        },
        cancel: closeConfirmModal,
      });
    } else {
      navigate("/mySchedule");
    }
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const updatedItems = [...schedule[date]];
    const [movedItem] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, movedItem);
    setSchedule((prev: NewSceduleInfo) => {
      return {
        ...prev,
        [date]: updatedItems,
      };
    });
  };

  return (
    <>
      <Header
        back
        backFn={back}
        title={"내가 저장한 일정"}
        borderBottom={false}
        right={
          mode === "EDIT"
            ? {
                content: <Style.Complete>완료</Style.Complete>,
                onClick: () => setMode("VIEW"),
              }
            : undefined
        }
      />
      <div style={{ height: 63, minHeight: 63 }}></div>
      <div style={{ marginLeft: 16 }}>
        <PeriodTag>{period}</PeriodTag>
      </div>
      <Style.TitleSection>
        {mode === "EDIT" ? (
          <Style.TitleInput />
        ) : (
          <Style.DestinationName>
            {/* {survey.destination.city}  */}
            여행
          </Style.DestinationName>
        )}
      </Style.TitleSection>
      <Style.SubRow>
        <Style.DatePeriod>
          {`${dateFormatting(startDate)} ~ ${dateFormatting(endDate)}`}
        </Style.DatePeriod>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button onClick={() => setMode("EDIT")}>
            <Icon.Edit fill={mode === "EDIT" ? "#FF7A00" : "#757575"} />
          </button>
          <button onClick={openDeleteModal}>
            <Icon.Delete />
          </button>
          {mode === "VIEW" && (
            <button onClick={() => setOpenShare(true)}>
              <Icon.Share />
            </button>
          )}
        </div>
        {/* <Style.RestButton onClick={openInitModal}>초기화</Style.RestButton> */}
      </Style.SubRow>
      <Style.DayList>
        {Array.from({ length: totalDay }, (_, index) => (
          <div key={index} style={{ position: "relative", height: 45 }}>
            <Style.Day
              isSelected={day === index + 1}
              onClick={() => {
                setDay(index + 1);
                setDate(startDate.add(index, "day").format("YYYY-MM-DD"));
              }}
            >
              {`Day ${index + 1}`}
            </Style.Day>
            <Style.UnderLine isSelected={day === index + 1} />
          </div>
        ))}
      </Style.DayList>
      <Style.Content>
        <Style.Wrapper>
          <DndProvider options={HTML5toTouch}>
            {schedule[date]?.map((item, index) => (
              <ScheduleCard
                moveItem={moveItem}
                onDragStart={(e) => onDragStart(e, index)}
                onDragEnter={(e) => onAvailableItemDragEnter(e, index)}
                onDragEnd={onDragEnd}
                onDelete={() => onDeleteSchedule(item.id)}
                onDragOver={onDragOver}
                title={item.content}
                description={item.detailPlans[0]?.detailContent || ""}
                isEditable={mode === "EDIT"}
                onChangeDescription={(value) =>
                  onChangeDescription(item.id, value)
                }
                onChangeContent={(value) => onChangeContent(item.id, value)}
                key={item.id}
                id={item.id}
                index={index}
              />
            ))}
          </DndProvider>

          {mode === "EDIT" && (
            <Style.CreateButtonBox>
              {/* <Style.PlusButton>
                <Icon.RoundPlus />
                <div>다른 장소 더 추천받기</div>
              </Style.PlusButton> */}
              <Style.PlusButton onClick={addItem}>
                <Icon.RoundPlus />
                <div>직접 입력해서 추가하기</div>
              </Style.PlusButton>
            </Style.CreateButtonBox>
          )}
        </Style.Wrapper>
      </Style.Content>
      {openShare && (
        <BottomSheet
          id={Number(params.id)}
          onClose={() => setOpenShare(false)}
        />
      )}
    </>
  );
};

export default MyDetailSchedule;
