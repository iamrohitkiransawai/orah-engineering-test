import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight, FontSize } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { IconButton, InputAdornment, TextField } from "@material-ui/core"
import CloseIcon from "@mui/icons-material/Close"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  useEffect(() => {
    void getStudents()
    console.log("data::", data)
  }, [getStudents])

  const onToolbarAction = (action: ToolbarAction, value?: string) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
    if (action === "search") {
      setSearchValue(value || "")
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} searchTerm={searchValue} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && data?.students && (
          <>
            {data.students
              .filter((s) => (searchValue ? `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchValue.toLowerCase()) : true))
              .map((s) => (
                <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
              ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}

type ToolbarAction = "roll" | "sort" | "search"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  searchTerm: string
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, searchTerm } = props
  const [showSearchField, setShowSearchField] = useState(false)
  const [searchValue, setSearchValue] = useState(searchTerm)

  const handleSearchClick = () => {
    setShowSearchField(true)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value)
  }

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onItemClick("search", searchValue)
  }

  return (
    <S.ToolbarContainer>
      <div onClick={() => onItemClick("sort")}>First Name</div>
      <S.SearchContainer>
        {showSearchField ? (
          <form onSubmit={handleSearchSubmit}>
            <S.SearchField
              placeholder="Search"
              value={searchValue}
              onChange={handleSearchChange}
              color={"warning"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        setShowSearchField(false)
                        setSearchValue("")
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        ) : (
          <S.SearchLabel onClick={handleSearchClick}>Search</S.SearchLabel>
        )}
      </S.SearchContainer>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    color: #fff;

    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  SearchContainer: styled.div`
    display: flex;
    align-items: center;
    margin-bottom: ${Spacing.u2};
  `,
  SearchLabel: styled.div`
    margin-right: ${Spacing.u2};
  `,
  SearchField: styled(TextField)`
    && {
      flex: 1;
      font-size: ${FontSize.u1};
      .MuiInputAdornment-root {
        cursor: pointer;
      }
    }
  `,
}
